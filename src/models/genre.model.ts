import {Entity, model, property} from '@loopback/repository';
import {SmallCategory} from "./category.model";

@model({settings: {strict: false}})
export class Genre extends Entity {
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

  @property({
    type: "object",
    jsonSchema: {
      type: 'array',
      items: {
        type: "object",
        properties: {
          id: {
            type: "string",
          },
          name: {
            type: "string",
          },
          is_active: {
            type: "boolean",
          },
        }
      },
      uniqueItems: true,
    }
  })
  categories: SmallCategory

// Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Genre>) {
    super(data);
  }
}

export interface GenreRelations {
  // describe navigational properties here
}

export type GenreWithRelations = Genre & GenreRelations;
