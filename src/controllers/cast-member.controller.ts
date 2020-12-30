import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getFilterSchemaFor,
  getModelSchemaRef,
  getWhereSchemaFor,
  patch,
  put,
  del,
  requestBody,
} from '@loopback/rest';
import {CastMembers} from '../models';
import {CastMemberRepository} from '../repositories';

export class CastMemberController {
  constructor(
    @repository(CastMemberRepository)
    public castMemberRepository : CastMemberRepository,
  ) {}

  @post('/cast-members', {
    responses: {
      '200': {
        description: 'CastMembers model instance',
        content: {'application/json': {schema: getModelSchemaRef(CastMembers)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CastMembers, {
            title: 'NewCastMembers',
            
          }),
        },
      },
    })
    castMembers: CastMembers,
  ): Promise<CastMembers> {
    return this.castMemberRepository.create(castMembers);
  }

  @get('/cast-members/count', {
    responses: {
      '200': {
        description: 'CastMembers model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.where(CastMembers) where?: Where<CastMembers>,
  ): Promise<Count> {
    return this.castMemberRepository.count(where);
  }

  @get('/cast-members', {
    responses: {
      '200': {
        description: 'Array of CastMembers model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(CastMembers, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(CastMembers) filter?: Filter<CastMembers>,
  ): Promise<CastMembers[]> {
    return this.castMemberRepository.find(filter);
  }

  @patch('/cast-members', {
    responses: {
      '200': {
        description: 'CastMembers PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CastMembers, {partial: true}),
        },
      },
    })
    castMembers: CastMembers,
    @param.where(CastMembers) where?: Where<CastMembers>,
  ): Promise<Count> {
    return this.castMemberRepository.updateAll(castMembers, where);
  }

  @get('/cast-members/{id}', {
    responses: {
      '200': {
        description: 'CastMembers model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(CastMembers, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(CastMembers, {exclude: 'where'}) filter?: FilterExcludingWhere<CastMembers>
  ): Promise<CastMembers> {
    return this.castMemberRepository.findById(id, filter);
  }

  @patch('/cast-members/{id}', {
    responses: {
      '204': {
        description: 'CastMembers PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CastMembers, {partial: true}),
        },
      },
    })
    castMembers: CastMembers,
  ): Promise<void> {
    await this.castMemberRepository.updateById(id, castMembers);
  }

  @put('/cast-members/{id}', {
    responses: {
      '204': {
        description: 'CastMembers PUT success',
      },
    },
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() castMembers: CastMembers,
  ): Promise<void> {
    await this.castMemberRepository.replaceById(id, castMembers);
  }

  @del('/cast-members/{id}', {
    responses: {
      '204': {
        description: 'CastMembers DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.castMemberRepository.deleteById(id);
  }
}
