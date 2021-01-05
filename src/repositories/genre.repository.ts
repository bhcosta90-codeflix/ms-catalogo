import {Genre, GenreRelations} from '../models';
import {Esv7DataSource} from '../datasources';
import {inject} from '@loopback/core';
import {Client} from 'es6';
import {pick} from 'lodash'
import {BaseRepository} from "./base.repository";

export class GenreRepository extends BaseRepository<Genre,
    typeof Genre.prototype.id,
    GenreRelations> {
  constructor(
      @inject('datasources.esv7') dataSource: Esv7DataSource,
  ) {
    super(Genre, dataSource);
  }
}
