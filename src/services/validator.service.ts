import {bind, /* inject, */ BindingScope} from '@loopback/core';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {AjvFactory, getModelSchemaRef, RestBindings, validateRequestBody} from "@loopback/rest";
import {inject} from "@loopback/context";
import {model} from "@loopback/repository";

export interface ValidateOptions
{
    data: any;
    entityClass: Function & {prototype: any}
}

@bind({scope: BindingScope.SINGLETON})
export class ValidatorService {
    cache = new Map();

    constructor(
        @inject(RestBindings.AJV_FACTORY) private ajv: AjvFactory
    ) {

    }

    async validate<T extends object>({data, entityClass}: ValidateOptions){
        const modelSchema = getModelSchemaRef(entityClass)

        if(!modelSchema){
            const error = new Error('Parameter entityClass is not a entity')
            error.name = 'NotEntityClass';
            throw error
        }
        const schemaRef = {$ref: modelSchema.$ref}
        const schemaName = Object.keys(modelSchema.definitions)[0]
        if(!this.cache.has(schemaName)) {
            this.cache.set(schemaName, modelSchema.definitions[schemaName])
        }

        const globalSchema = Array.from(this.cache).reduce<any>((obj, [key, value]) => {
            obj[key] = value
            return obj;
        }, {})

        await validateRequestBody(
            {value: data, schema: schemaRef},
            {required: true, content: {}},
            globalSchema,
            {
                ajvFactory: this.ajv
            }
        )
    }
}
