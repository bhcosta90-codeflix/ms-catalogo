import {bind, /* inject, */ BindingScope, service} from '@loopback/core';
import {RabbitmqSubscribe} from "../decorators";
import {repository} from "@loopback/repository";
import {CastMemberRepository} from "../repositories";
import {BaseSyncService} from "./base-sync.service";
import {ValidatorService} from "./validator.service";

@bind({scope: BindingScope.SINGLETON})
export class CastMemberSyncService extends BaseSyncService {
  constructor(
      @repository(CastMemberRepository) private repo: CastMemberRepository,
      @service(ValidatorService) private validator: ValidatorService
  ) {
      super(validator)
  }

  @RabbitmqSubscribe({
      exchange: 'amq.topic',
      queue: 'ms-catalogo/sync-videos/cast-member',
      routingKey: 'model.cast_member.*'
  })
  async handler({data, action}: {data: any, action: any}) {
      await this.sync({
          repo: this.repo,
          data,
          action
      })

  }
}
