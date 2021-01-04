import {CrudRepository, DefaultCrudRepository} from "@loopback/repository";
import {pick} from "lodash"
import {ValidatorService} from "./validator.service";

export interface SyncOptions {
    repo: DefaultCrudRepository<any, any>;
    data: any;
    action: string
}

export interface RelationsOptions {
    repoRelation: DefaultCrudRepository<any, any>;
    id: string,
    relationsIds: Array<string>,
    action: string
}

export abstract class BaseSyncService {
    protected constructor(
        public validateService: ValidatorService
    ) {
    }
    protected async sync({repo, data, action}: SyncOptions) {
        const {id} = data || {};
        const entity = this.createEntity(data, repo);

        switch (action) {
            case 'created':
                await this.validateService.validate({
                    data: entity,
                    entityClass: repo.entityClass,
                })
                await repo.create({
                    ...entity,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                break;
            case 'updated':
                await this.updateOrCreate(repo, id, entity)
                break;
            case 'deleted':
                await repo.deleteById(id)
                break;
        }
    }

    protected async syncRelation({repoRelation, id, relationsIds, action}: RelationsOptions) {
        const collections = await repoRelation.find({
            where: {
                or: relationsIds.map(idRelation => ({id: idRelation}))
            }
        })
        console.log(collections)
    }

    protected createEntity(data: any, repo: DefaultCrudRepository<any, any>) {
        return pick(data, Object.keys(repo.entityClass.definition.properties));
    }

    protected async updateOrCreate(repo: DefaultCrudRepository<any, any>, id: string, entity: any) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const exist = await repo.exists(id)

        await this.validateService.validate({
            data: entity,
            entityClass: repo.entityClass,
            ...(exist && {options: {partial: true}})
        })

        // eslint-disable-next-line @typescript-eslint/no-misused-promises,no-unused-expressions
        exist? await repo.updateById(id, entity) : await repo.create({
            ...entity,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
    }
}
