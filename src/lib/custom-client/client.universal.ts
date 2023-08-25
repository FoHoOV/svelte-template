import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { PUBLIC_API_URL } from '$env/static/public';
import { redirect } from '@sveltejs/kit';
import { ApiError, OpenAPI } from '../client';
import { decodeJwt, type JWTPayload } from 'jose';
import type { ApiRequestOptions } from '../client/core/ApiRequestOptions';
import type { ZodObject, ZodRawShape, z } from 'zod';

export const createRequest = (url: string, token?: string): Request => {
	const request = new Request(url);
	if (token) {
		request.headers.set('Authorization', `bearer: ${token}`);
	}
	return request;
};

export type ErrorHandler = <TError>(error: TError) => void;

export const genericGet = async <TResponse, TError = unknown>(
	path: string,
	parameters: Record<string, any> = {},
	config: RequestInit = {},
	onError: ErrorHandler | undefined = undefined
) => {
	const res = await fetch(`${path}?${new URLSearchParams(parameters)}`, {
		method: 'get',
		headers: {
			'Content-Type': 'application/json'
		},
		...config
	});
	const json = await res.json();

	if (!res.ok) {
		if (onError) {
			return onError(<TError>json);
		}
		throw Error('Some errors has occurred');
	}

	return <TResponse>json;
};

export const genericPost = async <TResponse, TError = unknown>(
	path: string,
	data: Record<string, any> = {},
	config: RequestInit = {},
	onError: ErrorHandler | undefined = undefined
) => {
	const res = await fetch(path, {
		method: 'post',
		body: JSON.stringify(data),
		headers: {
			'Content-Type': 'application/json'
		},
		...config
	});

	const json = await res.json();
	if (!res.ok) {
		if (onError) {
			return onError(<TError>json);
		}
		throw Error('Some errors has occurred');
	}

	return <TResponse>json;
};

export const getToExternal = async <TResponse, TError = unknown>(
	endPoint: string,
	data: Record<string, any> = {},
	config: RequestInit = {},
	onError: ErrorHandler | undefined = undefined
) => {
	return genericGet<TResponse, TError>(`${PUBLIC_API_URL}/${endPoint}`, data, config, onError);
};

export const postToExternal = async <TResponse, TError = unknown>(
	endPoint: string,
	data: Record<string, any> = {},
	config: RequestInit = {},
	onError: ErrorHandler | undefined = undefined
) => {
	return genericPost<TResponse, TError>(`${PUBLIC_API_URL}/${endPoint}`, data, config, onError);
};

export type ServiceCallOptions<
	TPromiseReturn,
	TZodRawShape extends ZodRawShape | never,
	TSchema extends ZodObject<TZodRawShape>,
	TErrorCallbackReturn
> = {
	serviceCall: () => Promise<TPromiseReturn>;
	errorSchema?: TSchema;
	isTokenRequired?: boolean;
	errorCallback?: TErrorCallbackReturn extends never
		? never
		: (e: ServiceError<any | z.infer<TSchema>>) => TErrorCallbackReturn;
};
type Resolver<T> = (options: ApiRequestOptions) => Promise<T>;

export enum ErrorType {
	VALIDATION_ERROR,
	API_ERROR,
	UNKNOWN_ERROR,
	UNAUTHORIZED
}

export type ServiceError<TData, TOriginalError = any> = {
	type: ErrorType;
	message: string;
	status: number;
	data: TData;
	original_error: TOriginalError;
};

export async function isTokenExpirationDateValidAsync(
	token: string | Resolver<string> | undefined
) {
	if (typeof token === 'function') {
		token = await token({
			url: '',
			method: 'HEAD'
		});
	}
	if (!token) {
		return false;
	}
	const parsedToken: JWTPayload = decodeJwt(token);
	if (!parsedToken.exp) {
		throw Error('expiration token not found in jwt');
	}
	if (parsedToken.exp * 1000 < Date.now()) {
		return false;
	}
	return true;
}

export async function callService<TPromiseReturn>({
	serviceCall,
	isTokenRequired = true
}: ServiceCallOptions<TPromiseReturn, never, never, never>): Promise<TPromiseReturn>;
export async function callService<TPromiseReturn, TErrorCallbackReturn>({
	serviceCall,
	isTokenRequired = true,
	errorCallback: TErrorCallbackReturn
}: ServiceCallOptions<TPromiseReturn, never, never, TErrorCallbackReturn>): Promise<TPromiseReturn>;
export async function callService<
	TPromiseReturn,
	TZodRawShape extends ZodRawShape,
	TSchema extends ZodObject<TZodRawShape>,
	TErrorCallbackReturn
>({
	serviceCall,
	isTokenRequired = true,
	errorSchema,
	errorCallback
}: ServiceCallOptions<
	TPromiseReturn,
	TZodRawShape,
	TSchema,
	TErrorCallbackReturn
>): Promise<TPromiseReturn>;
export async function callService<
	TPromiseReturn,
	TZodRawShape extends ZodRawShape,
	TSchema extends ZodObject<TZodRawShape>,
	TErrorCallbackReturn
>({
	serviceCall,
	isTokenRequired = true,
	errorSchema,
	errorCallback
}: ServiceCallOptions<TPromiseReturn, TZodRawShape, TSchema, TErrorCallbackReturn>) {
	if (isTokenRequired && !(await isTokenExpirationDateValidAsync(OpenAPI.TOKEN))) {
		OpenAPI.TOKEN = undefined;
		if (errorCallback) {
			return await errorCallback({
				type: ErrorType.UNAUTHORIZED,
				status: -1,
				message: 'Unauthorized, token has expired.',
				data: {},
				original_error: null
			});
		}
		if (browser) {
			goto('/login');
		} else {
			throw redirect(303, '/login');
		}
	}
	try {
		return await serviceCall();
	} catch (e) {
		//TODO: error handling, what if server returns an array of errors for one field! :( // TODO: simulate this
		let error;
		if (!(e instanceof ApiError)) {
			error = {
				type: ErrorType.UNKNOWN_ERROR,
				status: -1,
				message: 'some errors has occurred',
				data: e,
				original_error: e
			};

			if (errorCallback) {
				return await errorCallback(error);
			}

			return Promise.reject(error);
		}
		
		if (e.status === 401) {
			if (errorCallback) {
				return await errorCallback({
					type: ErrorType.UNAUTHORIZED,
					status: e.status,
					message: e.message,
					data: e.body,
					original_error: e
				});
			}
			if (browser) {
				goto('/login');
			} else {
				throw redirect(303, '/login');
			}
		}
		const parsedApiError = await errorSchema?.strip().partial().safeParseAsync(e.body.detail);
		if (parsedApiError?.success) {
			error = {
				type: ErrorType.VALIDATION_ERROR,
				status: e.status,
				message: e.message,
				data: parsedApiError.data,
				original_error: e
			};
			if (errorCallback) {
				return await errorCallback(error); // TODO: type is <any, any> and its not inferred, should we use more overloads? :(
			}
			return Promise.reject(error);
		}

		error = {
			type: ErrorType.API_ERROR,
			status: e.status,
			message: e.message,
			data: e.body,
			original_error: e
		};
		if (errorCallback) {
			return await errorCallback(error);
		}
		return Promise.reject(error);
	}
}
