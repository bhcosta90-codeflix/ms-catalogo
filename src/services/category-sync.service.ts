import {bind, /* inject, */ BindingScope} from '@loopback/core';
import {RabbitmqSubscribe} from "../decorators";
import {repository} from "@loopback/repository";
import {CategoryRepository} from "../repositories";

@bind({scope: BindingScope.TRANSIENT})
export class CategorySyncService {
  constructor(
      @repository(CategoryRepository) private categoryRepo: CategoryRepository
  ) {}

  @RabbitmqSubscribe({
      exchange: 'amq.topic',
      queue: 'ms-catalogo/sync-videos',
      routingKey: 'model.category.*'
  })
  handler({data}: {data: any}) {
      this.categoryRepo.create({
          ...data,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          created_at: new Date().toISOString(),
          // eslint-disable-next-line @typescript-eslint/naming-convention
          updated_at: new Date().toISOString(),
          active: true
      })
  }
}
