import {Entity, model, property} from '@loopback/repository';

@model({settings: {strict: false}})
export class Category extends Entity {
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
    jsonSchema: {
      minLength: 1,
      maxLength: 255
    },
  })
  name: string;

  @property({
    type: 'string',
    default: ''
  })
  description?: string;

  @property({
    type: 'boolean',
    required: false,
    default: true,
  })
  // eslint-disable-next-line @typescript-eslint/naming-convention
  is_active: boolean;

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

  constructor(data?: Partial<Category>) {
    super(data);
  }
}

export interface CategoryRelations {
  // describe navigational properties here
}

export type CategoryWithRelations = Category & CategoryRelations;
