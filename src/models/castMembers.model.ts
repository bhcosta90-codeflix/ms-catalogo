import {Entity, model, property} from '@loopback/repository';

@model({settings: {strict: false}})
export class CastMember extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true,
  })
  id: string;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'boolean',
    required: false,
    default: true,
  })
  // eslint-disable-next-line @typescript-eslint/naming-convention
  is_active: string;

  //{"id": "123131", "name": "categoria de teste"}
  @property({
    type: 'date',
    required: true
  })
  // eslint-disable-next-line @typescript-eslint/naming-convention
  created_at?: string;

  @property({
    type: 'date',
    required: true
  })
  // eslint-disable-next-line @typescript-eslint/naming-convention
  updated_at?: string;

// Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<CastMember>) {
    super(data);
  }
}

export interface CastMemberRelations {
  // describe navigational properties here
}

export type CastMemberWithRelations = CastMember & CastMemberRelations;