import {ModelCrudRestApiConfig} from '@loopback/rest-crud';
import {CastMember} from '../models';

const config: ModelCrudRestApiConfig = {
  model: CastMember,
  pattern: 'CrudRest',
  dataSource: '',
  basePath: '/cast-members',
};
module.exports = config;
