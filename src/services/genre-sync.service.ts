import {bind, /* inject, */ BindingScope} from '@loopback/core';
import {RabbitmqSubscribe} from "../decorators";
import {repository} from "@loopback/repository";
import {GenreRepository} from "../repositories";
import {BaseSyncService} from "./base-sync.service";

@bind({scope: BindingScope.SINGLETON})
export class GenreSyncService extends BaseSyncService {
  constructor(
      @repository(GenreRepository) private repo: GenreRepository
  ) {
      super()
  }

  @RabbitmqSubscribe({
      exchange: 'amq.topic',
      queue: 'ms-catalogo/sync-videos/genre',
      routingKey: 'model.genre.*'
  })
  async handler({data, action}: {data: any, action: any}) {
      await this.sync({
          repo: this.repo,
          data,
          action
      })
  }
}
