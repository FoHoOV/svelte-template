import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { PUBLIC_API_URL } from '$env/static/public';
import { redirect } from '@sveltejs/kit';
import { ApiError, OpenAPI } from '../client';
import { decodeJwt, type JWTPayload } from 'jose';
import type { ApiRequestOptions } from '../client/core/ApiRequestOptions';
import type { z } from 'zod';
import type { ErrorMessage } from '$lib/utils/types';
import type { Awaitable } from 'vitest';

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

const _handleUnauthenticatedUser = async <TSchema extends z.AnyZodObject, TPromise>(
	errorCallback: (error: ServiceError<TSchema>) => TPromise,
	error: ServiceError<TSchema>
): Promise<{ success: false; error: Awaited<TPromise>; result: undefined }> => {
	OpenAPI.TOKEN = undefined;

	return {
		success: false,
		result: undefined,
		error: await errorCallback(error)
	};
	// if (browser) { // TODO:
	// 	await goto('/login');
	// 	return { success: false, result: undefined, error: error };
	// } else {
	// 	throw redirect(303, '/login');
	// }
};

type Resolver<T> = (options: ApiRequestOptions) => Promise<T>;

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

export enum ErrorType {
	VALIDATION_ERROR,
	API_ERROR,
	UNKNOWN_ERROR,
	UNAUTHORIZED
}

export type ServiceError<TSchema extends z.AnyZodObject> =
	| {
			type: ErrorType.VALIDATION_ERROR;
			message: ErrorMessage;
			status: number;
			data: z.infer<TSchema>; // TODO: we should error if TSchema is undefined here
			originalError: ApiError;
	  }
	| {
			type: ErrorType.API_ERROR;
			message: ErrorMessage;
			status: number;
			data: unknown;
			originalError: ApiError;
	  }
	| {
			type: ErrorType.UNKNOWN_ERROR | ErrorType.UNAUTHORIZED;
			message: ErrorMessage;
			status: number;
			data: unknown;
			originalError: unknown;
	  };

export type ServiceCallOptions<
	TPromiseReturn,
	TSchema extends z.AnyZodObject,
	TErrorCallbackReturn
> = {
	serviceCall: () => Promise<TPromiseReturn>;
	errorSchema?: TSchema;
	isTokenRequired?: boolean;
	errorCallback?: (e: ServiceError<TSchema>) => Promise<TErrorCallbackReturn>;
};

export async function callService<
	TPromiseReturn,
	TSchema extends z.AnyZodObject,
	TErrorCallbackReturn = ServiceError<TSchema>
>({
	serviceCall,
	isTokenRequired = true,
	errorSchema,
	errorCallback = async (e) => {
		return e as any;
	}
}: ServiceCallOptions<TPromiseReturn, TSchema, TErrorCallbackReturn>): Promise<
	| {
			success: false;
			result: undefined;
			error: TErrorCallbackReturn;
	  }
	| { success: true; result: Awaited<TPromiseReturn>; error: undefined }
> {
	if (isTokenRequired && !(await isTokenExpirationDateValidAsync(OpenAPI.TOKEN))) {
		return await _handleUnauthenticatedUser(errorCallback, {
			type: ErrorType.UNAUTHORIZED,
			status: -1,
			message: 'Unauthorized, token has expired.',
			data: {},
			originalError: null
		});
	}
	try {
		return {
			success: true,
			result: await serviceCall(),
			error: undefined
		};
	} catch (e) {
		//TODO: error handling, what if server returns an array of errors for one field! :( // TODO: simulate this
		if (!(e instanceof ApiError)) {
			return {
				success: false,
				result: undefined,
				error: await errorCallback({
					type: ErrorType.UNKNOWN_ERROR,
					status: -1,
					message: 'An unknown error has occurred, please try again',
					data: e,
					originalError: e
				})
			};
		}

		if (e.status === 401) {
			return await _handleUnauthenticatedUser(errorCallback, {
				type: ErrorType.UNAUTHORIZED,
				status: e.status,
				message: e.message,
				data: e.body,
				originalError: e
			});
		}
		const parsedApiError = await errorSchema?.strip().partial().safeParseAsync(e.body.detail);
		if (parsedApiError?.success) {
			return {
				success: false,
				result: undefined,
				error: await errorCallback({
					type: ErrorType.VALIDATION_ERROR,
					status: e.status,
					message: e.message,
					data: parsedApiError.data,
					originalError: e
				})
			};
		}

		return {
			success: false,
			result: undefined,
			error: await errorCallback({
				type: ErrorType.API_ERROR,
				status: e.status,
				message: e.body.detail ?? e.message,
				data: e.body,
				originalError: e
			})
		};
	}
}
