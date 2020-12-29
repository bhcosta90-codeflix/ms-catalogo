import {bind, /* inject, */ BindingScope} from '@loopback/core';
import {RabbitmqSubscribe} from "../decorators";
import {repository} from "@loopback/repository";
import {GenreRepository} from "../repositories/genre.repository";

@bind({scope: BindingScope.TRANSIENT})
export class GenreSyncService {
  constructor(
      @repository(GenreRepository) private genreRepo: GenreRepository
  ) {}

  @RabbitmqSubscribe({
      exchange: 'amq.topic',
      queue: 'ms-catalogo/sync-videos',
      routingKey: 'model.genre.*'
  })
  async handler({data, action}: {data: any, action: any}) {
      switch(action){
          case 'created':
              await this.genreRepo.create({
                  ...data,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
              })
              break;
          case 'updated':
              await this.genreRepo.updateById(data.id, data)
              break;
          case 'deleted':
              await this.genreRepo.deleteById(data.id)
              break;
      }
  }
}
