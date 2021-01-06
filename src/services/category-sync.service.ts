import {bind, /* inject, */ BindingScope, service} from '@loopback/core';
import {RabbitmqSubscribe} from "../decorators";
import {repository} from "@loopback/repository";
import {CastMemberRepository, CategoryRepository} from "../repositories";
import {BaseSyncService} from "./base-sync.service";
import {ValidatorService} from "./validator.service";
import {ResponseEnum} from "../servers";

@bind({scope: BindingScope.SINGLETON})
export class CategorySyncService extends BaseSyncService{
    constructor(
        @repository(CategoryRepository) private repo: CategoryRepository,
        @service(ValidatorService) private validator: ValidatorService
    ) {
        super(validator)
    }

    @RabbitmqSubscribe({
        exchange: 'amq.topic',
        queue: 'ms-catalogo/sync-videos/category',
        routingKey: 'model.category.*',
        queueOptions: {
            deadLetterExchange: 'dlx.amq.topic'
        }
    })
    async handler({data, action}: {data: any, action: any}) {
        await this.sync({
            repo: this.repo,
            data,
            action
        })
    }
}
