/* tslint:disable */
/* eslint-disable */
/**
 * FastAPI
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 0.1.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime';
/**
 * 
 * @export
 * @interface Todo
 */
export interface Todo {
    /**
     * 
     * @type {string}
     * @memberof Todo
     */
    title: string;
    /**
     * 
     * @type {string}
     * @memberof Todo
     */
    description: string;
    /**
     * 
     * @type {boolean}
     * @memberof Todo
     */
    is_done: boolean;
    /**
     * 
     * @type {number}
     * @memberof Todo
     */
    id: number;
    /**
     * 
     * @type {number}
     * @memberof Todo
     */
    user_id: number;
}

/**
 * Check if a given object implements the Todo interface.
 */
export function instanceOfTodo(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "title" in value;
    isInstance = isInstance && "description" in value;
    isInstance = isInstance && "is_done" in value;
    isInstance = isInstance && "id" in value;
    isInstance = isInstance && "user_id" in value;

    return isInstance;
}

export function TodoFromJSON(json: any): Todo {
    return TodoFromJSONTyped(json, false);
}

export function TodoFromJSONTyped(json: any, ignoreDiscriminator: boolean): Todo {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'title': json['title'],
        'description': json['description'],
        'is_done': json['is_done'],
        'id': json['id'],
        'user_id': json['user_id'],
    };
}

export function TodoToJSON(value?: Todo | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'title': value.title,
        'description': value.description,
        'is_done': value.is_done,
        'id': value.id,
        'user_id': value.user_id,
    };
}

