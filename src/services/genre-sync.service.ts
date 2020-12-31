import {bind, /* inject, */ BindingScope, service} from '@loopback/core';
import {RabbitmqSubscribe} from "../decorators";
import {repository} from "@loopback/repository";
import {CastMemberRepository, GenreRepository} from "../repositories";
import {BaseSyncService} from "./base-sync.service";
import {ValidatorService} from "./validator.service";

@bind({scope: BindingScope.SINGLETON})
export class GenreSyncService extends BaseSyncService {
  constructor(
      @repository(GenreRepository) private repo: GenreRepository,
      @service(ValidatorService) private validator: ValidatorService
  ) {
      super(validator)
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
