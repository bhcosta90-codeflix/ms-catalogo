import {CrudRepository, DefaultCrudRepository, EntityNotFoundError} from "@loopback/repository";
import {pick} from "lodash"
import {ValidatorService} from "./validator.service";

export interface SyncOptions {
    repo: DefaultCrudRepository<any, any>;
    data: any;
    action: string
}

export interface RelationsOptions {
    id: string,
    action: string
    repo: DefaultCrudRepository<any, any>;
    relationName: string;
    relationsIds: Array<string>,
    relationRepo: DefaultCrudRepository<any, any>;
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

    protected async syncRelation({relationRepo, id, relationsIds, action, repo, relationName}: RelationsOptions) {
        const fieldsRelations = this.extractFieldsRelation({repo, relationName})

        const collections = await relationRepo.find({
            where: {
                or: relationsIds.map(idRelation => ({id: idRelation}))
            }
        }, fieldsRelations)

        if(!collections.length){
            const error = new EntityNotFoundError(relationRepo.entityClass, relationsIds);
            error.name = 'ENTITY_NOT_FOUND';
            throw error;
        }

        switch(action){
            case 'attach':
                await (repo as any).relationAttach(id, relationName, collections)
                break;
            case 'detach':
                await (repo as any).relationDetach(id, relationName, collections)
                break;
        }
    }

    protected extractFieldsRelation({repo, relationName}: {repo: DefaultCrudRepository<any, any>, relationName: string})
    {
        return Object.keys(
            repo.modelClass.definition.properties[relationName].jsonSchema.items.properties
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
