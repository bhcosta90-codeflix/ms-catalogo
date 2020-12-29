import {ApplicationConfig, Context, CoreBindings, Server} from '@loopback/core';
import {Channel, connect, Connection, Replies} from 'amqplib';
import AssertQueue = Replies.AssertQueue;
import AssertExchange = Replies.AssertExchange;
import {CategoryRepository} from "../repositories";
import {repository} from "@loopback/repository";
import {inject} from "@loopback/context";
import {RabbitmqBindings} from "../keys";

export interface RabbitmqConfig {
  uri: string
}

export class RabbitmqServer extends Context implements Server {
  private _listening: boolean;
  conn: Connection;
  channel: Channel;

  constructor(
      @inject(RabbitmqBindings.CONFIG) private config: RabbitmqConfig,
      @repository(CategoryRepository) private categoryRepo: CategoryRepository
  ) {
    super();
    console.log(this.config);
  }

  async start(): Promise<void> {
    this.conn = await connect(this.config.uri);
    this._listening = true;
    this.boot()
  }

  async boot(){
    this.channel = await this.conn.createChannel();
    const queue: AssertQueue = await this.channel.assertQueue('ms-catalogo/sync-videos')
    const exchange: AssertExchange = await this.channel.assertExchange('amq.topic', 'topic');

    await this.channel.bindQueue(queue.queue, exchange.exchange, 'model.*.*');

    // const result = channel.sendToQueue('first-queue', Buffer.from('hello-world'))
    // const result = channel.publish('amq.direct', 'routing-first-queue', Buffer.from('publicado por routing key'))

    this.channel.consume(queue.queue, (message) => {
      if(!message) {
        return;
      }

      const data = (JSON.parse(message.content.toString()))
      const [model, action] = message.fields.routingKey.split('.').slice(1);
      this.sync({model, action, data})
          .then(() => this.channel.ack(message))
          .catch((error) => {
            console.log(error)
            this.channel.reject(message, false)
          })
    });
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

  async stop(): Promise<void> {
    await this.conn.close();
    this._listening = false;
    return undefined;
  }

  get listening(): boolean {
    return this._listening
  }
}
