import {DefaultCrudRepository} from "@loopback/repository";
import {pick} from "lodash"

export interface SyncOptions {
    repo: DefaultCrudRepository<any, any>;
    data: any;
    action: string
}

export abstract class BaseSyncService {
    protected async sync({repo, data, action}: SyncOptions) {
        console.log(repo.entityClass, data, action)
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
                await repo.updateById(id, entity)
                break;
            case 'deleted':
                await repo.deleteById(id)
                break;
        }
    }

    protected createEntity(data: any, repo: DefaultCrudRepository<any, any>) {
        return pick(data, Object.keys(repo.entityClass.definition.properties));
    }
}
