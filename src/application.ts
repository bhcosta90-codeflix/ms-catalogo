import {BootMixin} from '@loopback/boot';
import {Application, ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestComponent, RestServer} from '@loopback/rest';
import {RestExplorerBindings} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {MySequence} from './sequence';
import {RabbitmqServer} from "./servers";
import {EntityComponent, RestExplorerComponent, ValidatorsComponent} from "./components";

export {ApplicationConfig};

export class MsCatalogApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(Application)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    options.rest.sequence = MySequence;
    this.component(RestComponent);

    const restServer = this.getSync<RestServer>('servers.RestServer');
    restServer.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);
    this.component(ValidatorsComponent);
    this.component(EntityComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };

    this.servers([RabbitmqServer]);
  }

  async boot(){
    await super.boot();
    // const categoryRepo = this.getSync('repositories.CategoryRepository')
    //
    // // @ts-ignore
    // const category = await categoryRepo.find({where: {id : '08b59243-b846-4b06-9e32-17166b0546cc'}})
    //
    // // @ts-ignore
    // categoryRepo.updateById(category[0].id, {
    //   ...category[0],
    //   name: Math.floor(new Date().getTime()/1000.0).toString()
    // })
  }
}
