import {ModelCrudRestApiConfig} from '@loopback/rest-crud';
import {Genre} from '../models';

const config: ModelCrudRestApiConfig = {
  model: Genre,
  pattern: 'CrudRest',
  dataSource: '',
  basePath: '/genres',
};
module.exports = config;
