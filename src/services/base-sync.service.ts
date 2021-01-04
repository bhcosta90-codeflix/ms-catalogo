import {CrudRepository, DefaultCrudRepository, EntityNotFoundError} from "@loopback/repository";
import {pick} from "lodash"
import {ValidatorService} from "./validator.service";

export interface SyncOptions {
    repo: DefaultCrudRepository<any, any>;
    data: any;
    action: string
}

export interface RelationsOptions {
    repoRelation: DefaultCrudRepository<any, any>;
    repo: DefaultCrudRepository<any, any>;
    relation: string
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

    protected async syncRelation({repoRelation, id, relationsIds, action, repo, relation}: RelationsOptions) {
        const fieldsRelations = this.extractFieldsRelation({repo, relation})

        const collections = await repoRelation.find({
            where: {
                or: relationsIds.map(idRelation => ({id: idRelation}))
            }
        }, fieldsRelations)

        if(collections.length == 0){
            const error = new EntityNotFoundError(repoRelation.entityClass, relationsIds);
            error.name = 'ENTITY_NOT_FOUND';
            throw error;
        }

        switch(action){
            case 'attach':
                await (repo as any).attachCategories(id, collections)
                break;
        }
    }

    protected extractFieldsRelation({repo, relation}: {repo: DefaultCrudRepository<any, any>, relation: string})
    {
        return Object.keys(
            repo.modelClass.definition.properties[relation].jsonSchema.items.properties
        ).reduce((obj: any, field: string) => {
            obj[field] = true;
            return obj;
        }, {})
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
