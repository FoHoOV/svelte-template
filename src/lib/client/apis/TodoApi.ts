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


import * as runtime from '../runtime';
import type {
  HTTPValidationError,
  SearchTodoStatus,
  Todo,
  TodoCreate,
} from '../models/index';
import {
    HTTPValidationErrorFromJSON,
    HTTPValidationErrorToJSON,
    SearchTodoStatusFromJSON,
    SearchTodoStatusToJSON,
    TodoFromJSON,
    TodoToJSON,
    TodoCreateFromJSON,
    TodoCreateToJSON,
} from '../models/index';

export interface CreateForUserRequest {
    todoCreate: TodoCreate;
}

export interface GetAllRequest {
    skip?: number;
    limit?: number;
}

export interface GetForUserRequest {
    status?: SearchTodoStatus;
}

export interface RemoveRequest {
    todo: Todo;
}

export interface UpdateRequest {
    todo: Todo;
}

/**
 * 
 */
export class TodoApi extends runtime.BaseAPI {

    /**
     * Create For User
     */
    async createForUserRaw(requestParameters: CreateForUserRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Todo>> {
        if (requestParameters.todoCreate === null || requestParameters.todoCreate === undefined) {
            throw new runtime.RequiredError('todoCreate','Required parameter requestParameters.todoCreate was null or undefined when calling createForUser.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("OAuth2PasswordBearer", []);
        }

        const response = await this.request({
            path: `/todo/create`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: TodoCreateToJSON(requestParameters.todoCreate),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => TodoFromJSON(jsonValue));
    }

    /**
     * Create For User
     */
    async createForUser(todoCreate: TodoCreate, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Todo> {
        const response = await this.createForUserRaw({ todoCreate: todoCreate }, initOverrides);
        return await response.value();
    }

    /**
     * Get All
     */
    async getAllRaw(requestParameters: GetAllRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<Todo>>> {
        const queryParameters: any = {};

        if (requestParameters.skip !== undefined) {
            queryParameters['skip'] = requestParameters.skip;
        }

        if (requestParameters.limit !== undefined) {
            queryParameters['limit'] = requestParameters.limit;
        }

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/todo/all-users`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(TodoFromJSON));
    }

    /**
     * Get All
     */
    async getAll(skip?: number, limit?: number, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<Todo>> {
        const response = await this.getAllRaw({ skip: skip, limit: limit }, initOverrides);
        return await response.value();
    }

    /**
     * Get For User
     */
    async getForUserRaw(requestParameters: GetForUserRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<Todo>>> {
        const queryParameters: any = {};

        if (requestParameters.status !== undefined) {
            queryParameters['status'] = requestParameters.status;
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("OAuth2PasswordBearer", []);
        }

        const response = await this.request({
            path: `/todo/list`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(TodoFromJSON));
    }

    /**
     * Get For User
     */
    async getForUser(status?: SearchTodoStatus, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<Todo>> {
        const response = await this.getForUserRaw({ status: status }, initOverrides);
        return await response.value();
    }

    /**
     * Remove
     */
    async removeRaw(requestParameters: RemoveRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<any>> {
        if (requestParameters.todo === null || requestParameters.todo === undefined) {
            throw new runtime.RequiredError('todo','Required parameter requestParameters.todo was null or undefined when calling remove.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("OAuth2PasswordBearer", []);
        }

        const response = await this.request({
            path: `/todo/remove`,
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
            body: TodoToJSON(requestParameters.todo),
        }, initOverrides);

        if (this.isJsonMime(response.headers.get('content-type'))) {
            return new runtime.JSONApiResponse<any>(response);
        } else {
            return new runtime.TextApiResponse(response) as any;
        }
    }

    /**
     * Remove
     */
    async remove(todo: Todo, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<any> {
        const response = await this.removeRaw({ todo: todo }, initOverrides);
        return await response.value();
    }

    /**
     * Update
     */
    async updateRaw(requestParameters: UpdateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Todo>> {
        if (requestParameters.todo === null || requestParameters.todo === undefined) {
            throw new runtime.RequiredError('todo','Required parameter requestParameters.todo was null or undefined when calling update.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("OAuth2PasswordBearer", []);
        }

        const response = await this.request({
            path: `/todo/update`,
            method: 'PATCH',
            headers: headerParameters,
            query: queryParameters,
            body: TodoToJSON(requestParameters.todo),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => TodoFromJSON(jsonValue));
    }

    /**
     * Update
     */
    async update(todo: Todo, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Todo> {
        const response = await this.updateRaw({ todo: todo }, initOverrides);
        return await response.value();
    }

}