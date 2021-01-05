import {Application, Binding, Context, CoreBindings, Server} from '@loopback/core';
import {Channel, ConfirmChannel, Message, Options, Replies} from 'amqplib';
import {CastMemberRepository} from "../repositories";
import {repository} from "@loopback/repository";
import {inject} from "@loopback/context";
import {RabbitmqBindings} from "../keys";
import {AmqpConnectionManager, AmqpConnectionManagerOptions, ChannelWrapper, connect} from "amqp-connection-manager";
import {MetadataInspector} from "@loopback/metadata"
import {RABBITMQ_SUBSCRIBE_DECORATOR, RabbitmqSubscribeMetada} from "../decorators";

export enum ResponseEnum {
  ACK,
  REQUEUE,
  NACK,
}

export interface RabbitmqConfig {
  uri: string,
  connOptions?: AmqpConnectionManagerOptions
  exchanges?: { name: string, type: string, options?: Options.AssertExchange }[],
  defaultHandler?: ResponseEnum
}

export class RabbitmqServer extends Context implements Server {
  private _listening: boolean;
  private _conn: AmqpConnectionManager;
  private _channelWrapper: ChannelWrapper;
  channel: Channel;

  constructor(
      @inject(CoreBindings.APPLICATION_INSTANCE) public app: Application,
      @inject(RabbitmqBindings.CONFIG) private config: RabbitmqConfig,
      @repository(CastMemberRepository) private categoryRepo: CastMemberRepository
  ) {
    super(app);
  }

  async start(): Promise<void> {
    this._conn = connect([this.config.uri], this.config.connOptions);
    this._channelWrapper = this._conn.createChannel()
    this._channelWrapper.on('connect', () => {
      console.log('SUCCESSFUL - Connected rabbitmq channel')
      this._listening = true;
    }).on('error', (err, {name}) => {
      this._listening = false;
      console.log(`FAILED - Rabbitmq setup - name = ${name} | error = ${err}`)
    })
    await this.setupExchanges()
    await this.bindingSubscribers();
    // this.boot()
  }

  private async setupExchanges() {
    return this._channelWrapper.addSetup(async (channel: ConfirmChannel) => {
      if (!this.config.exchanges)
        return;

      await Promise.all(this.config.exchanges.map((exchange) => {
        // eslint-disable-next-line no-void
        void channel.assertExchange(exchange.name, exchange.type, exchange.options);
      }))
    })
  }

  private async bindingSubscribers() {
    this.getSubscribers()
        .map(async item => {
          await this._channelWrapper.addSetup(async (channel: ConfirmChannel) => {
            const {exchange, routingKey, queueOptions, queue} = item.metadata
            const assertQueue = await channel.assertQueue(queue ?? '', queueOptions ?? undefined)
            const routingKeys = Array.isArray(routingKey) ? routingKey : [routingKey]

            await Promise.all(routingKeys.map((routing: string) => channel.bindQueue(assertQueue.queue, exchange, routing)));

            await this.consume({
              channel,
              queue: assertQueue.queue,
              method: item.method
            })
          });
        });
  }

  private getSubscribers(): { method: Function, metadata: RabbitmqSubscribeMetada }[] {
    const bindings: Array<Readonly<Binding>> = this.find('services.*');
    return bindings.map(binding => {
      const metadata = MetadataInspector.getAllMethodMetadata<RabbitmqSubscribeMetada>(
          RABBITMQ_SUBSCRIBE_DECORATOR, binding.valueConstructor?.prototype)
      if (!metadata) {
        return [];
      }

      const methods: Array<any> = [];

      for (const methodName in metadata) {
        if (!Object.prototype.hasOwnProperty.call(metadata, methodName)) {
          return;
        }
        const service = this.getSync(binding.key) as any

        methods.push({
          method: service[methodName].bind(service),
          metadata: metadata[methodName]
        })
      }

      return methods.reduce((collection: any, item: any) => {
        collection.push(...item)
        return collection
      });
    });

  }

  private async consume({channel, queue, method}: { channel: ConfirmChannel, queue: string, method: Function }) {
    await channel.consume(queue, async message => {
      try {
        if (!message) {
          throw new Error('Receive null message')
        }

        const content = message.content;
        if (content) {
          let data;
          try {
            data = JSON.parse(content.toString());
          } catch (e) {
            data = null;
          }

          const [action] = message.fields.routingKey.split('.').slice(2);
          const responseType = await method({data, message, channel, action})
          this.dispatchResponse(channel, message, responseType)
        }
      } catch (e) {
        console.log(e)
        if(!message){
          return;
        }
        this.dispatchResponse(channel, message, this.config?.defaultHandler)
      }
    })
  }

  async sync({model, action, data}: { model: string, action: string, data: any }){
    switch (model) {
      case 'category':
        switch (action) {
          case 'created':
            await this.categoryRepo.create({
              ...data,
              // eslint-disable-next-line @typescript-eslint/naming-convention
              created_at: new Date().toISOString(),
              // eslint-disable-next-line @typescript-eslint/naming-convention
              updated_at: new Date().toISOString(),
              active: true
            })
            break;

          case 'updated':
            await this.categoryRepo.updateById(data.id, data)
            break;

          case 'deleted':
            await this.categoryRepo.deleteById(data.id)
            break;
        }
        break;
    }
  }

  private dispatchResponse(channel: Channel, message: Message, responseType?: ResponseEnum)
  {
    switch(responseType){
      case ResponseEnum.REQUEUE:
        channel.nack(message, false, true);
        break;
      case ResponseEnum.NACK:
        channel.nack(message, false, false);
        break;
      case ResponseEnum.ACK:
      default:
        channel.ack(message)
    }
  }

  async stop(): Promise<void> {
    await this.conn.close();
    this._listening = false;
    return undefined;
  }

  get listening(): boolean {
    return this._listening
  }

  get conn(): AmqpConnectionManager {
    return this._conn
  }

  get channelManager(): ChannelWrapper {
    return this._channelWrapper
  }
}
