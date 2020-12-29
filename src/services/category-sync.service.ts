import {bind, /* inject, */ BindingScope} from '@loopback/core';
import {RabbitmqSubscribe} from "../decorators";
import {repository} from "@loopback/repository";
import {CastMemberRepository} from "../repositories";

@bind({scope: BindingScope.TRANSIENT})
export class CategorySyncService {
  constructor(
      @repository(CastMemberRepository) private categoryRepo: CastMemberRepository
  ) {}

  @RabbitmqSubscribe({
      exchange: 'amq.topic',
      queue: 'ms-catalogo/sync-videos',
      routingKey: 'model.category.*'
  })
  async handler({data, action}: {data: any, action: any}) {
      switch(action){
          case 'created':
              await this.categoryRepo.create({
                  ...data,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
              })
              break;
          case 'updated':
              await this.categoryRepo.updateById(data.id, data)
              break;
          case 'deleted':
              await this.categoryRepo.deleteById(data.id)
              break;
      }

  }
}