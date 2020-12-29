import {bind, /* inject, */ BindingScope} from '@loopback/core';
import {RabbitmqSubscribe} from "../decorators";
import {repository} from "@loopback/repository";
import {CastMemberRepository} from "../repositories";

@bind({scope: BindingScope.TRANSIENT})
export class CastMemberSyncService {
  constructor(
      @repository(CastMemberRepository) private castMemberRepo: CastMemberRepository
  ) {}

  @RabbitmqSubscribe({
      exchange: 'amq.topic',
      queue: 'ms-catalogo/sync-videos',
      routingKey: 'model.cast-member.*'
  })
  async handler({data, action}: {data: any, action: any}) {
      console.log(data, action)
      switch(action){
          case 'created':
              await this.castMemberRepo.create({
                  ...data,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
              })
              break;
          case 'updated':
              await this.castMemberRepo.updateById(data.id, data)
              break;
          case 'deleted':
              await this.castMemberRepo.deleteById(data.id)
              break;
      }

  }
}
