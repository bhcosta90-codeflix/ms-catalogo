import {bind, /* inject, */ BindingScope, service} from '@loopback/core';
import {RabbitmqSubscribe} from "../decorators";
import {repository} from "@loopback/repository";
import {CategoryRepository, GenreRepository} from "../repositories";
import {BaseSyncService} from "./base-sync.service";
import {ValidatorService} from "./validator.service";

@bind({scope: BindingScope.SINGLETON})
export class GenreCategoriesSyncService extends BaseSyncService {
    constructor(
        @repository(GenreRepository) private repo: GenreRepository,
        @service(ValidatorService) private validator: ValidatorService,
        @repository(CategoryRepository) private repoCategory: CategoryRepository
    ) {
        super(validator)
    }

    @RabbitmqSubscribe({
        exchange: 'amq.topic',
        queue: 'ms-catalogo/sync-videos/genre_categories',
        routingKey: 'model.genre_categories.*'
    })
    async handlerCategories({data, action}: { data: any, action: any }) {
        await this.syncRelation({
            id: data.id,
            action,
            repo: this.repo,
            relationName: 'categories',
            relationsIds: data.relations_id,
            relationRepo: this.repoCategory,
        })
    }
}
