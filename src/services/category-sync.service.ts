import {bind, /* inject, */ BindingScope} from '@loopback/core';
import {RabbitmqSubscribe} from "../decorators";
import {repository} from "@loopback/repository";
import {CategoryRepository} from "../repositories";
import {BaseSyncService} from "./base-sync.service";

@bind({scope: BindingScope.SINGLETON})
export class CategorySyncService extends BaseSyncService{
  constructor(
      @repository(CategoryRepository) private repo: CategoryRepository
  ) {
      super()
  }

  @RabbitmqSubscribe({
      exchange: 'amq.topic',
      queue: 'ms-catalogo/sync-videos/category',
      routingKey: 'model.category.*'
  })
  async handler({data, action}: {data: any, action: any}) {
      await this.sync({
          repo: this.repo,
          data,
          action
      })

  }
}
