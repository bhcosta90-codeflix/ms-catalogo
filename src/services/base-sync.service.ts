import {CrudRepository, DefaultCrudRepository} from "@loopback/repository";
import {pick} from "lodash"
import {exists} from "fs";

export interface SyncOptions {
    repo: DefaultCrudRepository<any, any>;
    data: any;
    action: string
}

export abstract class BaseSyncService {
    protected async sync({repo, data, action}: SyncOptions) {
        const {id} = data || {};
        const entity = this.createEntity(data, repo);

        switch (action) {
            case 'created':
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

    protected createEntity(data: any, repo: DefaultCrudRepository<any, any>) {
        return pick(data, Object.keys(repo.entityClass.definition.properties));
    }

    protected async updateOrCreate(repo: DefaultCrudRepository<any, any>, id: string, entity: any){
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const exist = await repo.exists(id)

        // eslint-disable-next-line @typescript-eslint/no-misused-promises,no-unused-expressions
        exist? await repo.updateById(id, entity) : await repo.create({
            ...entity,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
    }
}
