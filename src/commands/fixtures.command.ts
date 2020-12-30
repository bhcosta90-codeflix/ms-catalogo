import {default as chalk} from 'chalk'
import {MsCatalogApplication} from "../application";
import * as config from './../config'
import {Esv7DataSource} from "../datasources";
import {Client} from 'es7';
import fixtures from './../fixtures'
import {DefaultCrudRepository} from "@loopback/repository";

export class FixturesCommand {
    static command = 'fixtures'
    static description = 'Fixture data in ElasticSearch';
    private app: MsCatalogApplication

    async run() {
        console.log(chalk.green('Fixture data'))
        await this.boot()
        console.log(chalk.green('Delete all documents'))
        await this.deleteAllDocuments()

        for (const fixture of fixtures){
            const repository = this.getRepository<DefaultCrudRepository<any, any>>(fixture.model)
            await repository.create({
                ...fixture.fields,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
        }
        console.log(chalk.green('Documents generate'))

    }

    private async boot() {
        this.app = new MsCatalogApplication(config);
        await this.app.boot();
    }

    private async deleteAllDocuments() {
        const dataSource: Esv7DataSource = this.app.getSync<Esv7DataSource>('datasources.esv7')
        // @ts-ignore
        const adapter = dataSource.adapter;

        const index = adapter.settings.index
        const client: Client = adapter.db
        await client.delete_by_query({
            index: index,
            body: {
                query: {match_all: {}}
            }
        })
    }

    private getRepository<T>(modelName: string) :T{
        return this.app.getSync(`repositories.${modelName}Repository`)
    }
}