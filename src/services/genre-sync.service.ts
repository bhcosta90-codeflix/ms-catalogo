import {bind, /* inject, */ BindingScope, service} from '@loopback/core';
import {RabbitmqSubscribe} from "../decorators";
import {repository} from "@loopback/repository";
import {CategoryRepository, GenreRepository} from "../repositories";
import {BaseSyncService} from "./base-sync.service";
import {ValidatorService} from "./validator.service";

@bind({scope: BindingScope.SINGLETON})
export class GenreSyncService extends BaseSyncService {
    constructor(
        @repository(GenreRepository) private repo: GenreRepository,
        @service(ValidatorService) private validator: ValidatorService,
        @repository(CategoryRepository) private repoCategory: CategoryRepository
    ) {
        super(validator)
    }

    @RabbitmqSubscribe({
        exchange: 'amq.topic',
        queue: 'ms-catalogo/sync-videos/genre',
        routingKey: 'model.genre.*',
        queueOptions: {
            deadLetterExchange: 'dlx.amq.topic'
        }
    })
    async handler({data, action}: { data: any, action: any }) {
        await this.sync({
            repo: this.repo,
            data,
            action
        })
    }
}
