import { browser } from '$app/environment';
import { goto, invalidateAll } from '$app/navigation';
import { PUBLIC_API_URL } from '$env/static/public';
import { redirect } from '@sveltejs/kit';
import type { z } from 'zod';
import type { ErrorMessage } from '$lib/utils/types';
import { RequiredError, FetchError, ResponseError } from '../client/runtime';
import { TokenError } from './clients';

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
): Promise<{ success: false; error: Awaited<TPromise> }> => {
	const result = await errorCallback(error);
	if (browser) {
		await invalidateAll();
		await goto('/user/logout?session-expired=true');
		return { success: false, error: result };
	} else {
		throw redirect(303, '/user/logout?session-expired=true');
	}
};

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
			data: z.infer<TSchema>;
			originalError: ResponseError | RequiredError | FetchError;
	  }
	| {
			type: ErrorType.API_ERROR;
			message: ErrorMessage;
			status: number;
			data: unknown;
			originalError: ResponseError | RequiredError | FetchError;
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
	errorCallback?: (e: ServiceError<TSchema>) => Promise<TErrorCallbackReturn>;
};

export async function callService<
	TPromiseReturn,
	TSchema extends z.AnyZodObject,
	TErrorCallbackReturn = ServiceError<TSchema>
>({
	serviceCall,
	errorSchema,
	errorCallback = async (e) => {
		return e as any;
	}
}: ServiceCallOptions<TPromiseReturn, TSchema, TErrorCallbackReturn>): Promise<
	| {
			success: false;
			error: TErrorCallbackReturn;
	  }
	| { success: true; result: Awaited<TPromiseReturn> }
> {
	try {
		return {
			success: true,
			result: await serviceCall()
		};
	} catch (e) {
		if (e instanceof FetchError) {
			return {
				success: false,
				error: await errorCallback({
					type: ErrorType.API_ERROR,
					status: -1,
					message: 'An unknown error has occurred, please try again',
					data: e,
					originalError: e
				})
			};
		}

		if (e instanceof RequiredError) {
			return {
				success: false,
				error: await errorCallback({
					type: ErrorType.API_ERROR,
					status: -1,
					message: e.message,
					data: e,
					originalError: e
				})
			};
		}

		if (e instanceof ResponseError) {
			if (e.response.status === 401) {
				return await _handleUnauthenticatedUser(errorCallback, {
					type: ErrorType.UNAUTHORIZED,
					status: e.response.status,
					message: e.message,
					data: await e.response.json(),
					originalError: e
				});
			}
			const parsedApiError = await errorSchema
				?.strip()
				.partial()
				.safeParseAsync((await e.response.json()).detail);
			if (parsedApiError?.success) {
				return {
					success: false,
					error: await errorCallback({
						type: ErrorType.VALIDATION_ERROR,
						status: e.response.status,
						message: e.message,
						data: parsedApiError.data,
						originalError: e
					})
				};
			}
		}

		if (e instanceof TokenError) {
			return await _handleUnauthenticatedUser(errorCallback, {
				type: ErrorType.UNAUTHORIZED,
				status: -1,
				message: e.message,
				data: { detail: 'Invalid (client-side validations).' },
				originalError: e
			});
		}

		return {
			success: false,
			error: await errorCallback({
				type: ErrorType.UNKNOWN_ERROR,
				status: -1,
				message: 'An unknown error has occurred, please try again',
				data: e,
				originalError: e
			})
		};
	}
}
