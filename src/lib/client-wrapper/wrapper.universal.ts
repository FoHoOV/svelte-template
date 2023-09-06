import { browser } from '$app/environment';
import { goto, invalidateAll } from '$app/navigation';
import { PUBLIC_API_URL } from '$env/static/public';
import { error, redirect } from '@sveltejs/kit';
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

export const handleUnauthenticatedUser = async () => {
	if (browser) {
		await invalidateAll();
		await goto('/user/logout?session-expired=true');
		return;
	} else {
		throw redirect(303, '/user/logout?session-expired=true');
	}
};

const _defaultUnAuthenticatedUserHandler = async <
	TSchema extends z.AnyZodObject,
	TErrorCallbackResult extends Promise<unknown>
>(
	errorCallback: Required<
		ServiceCallOptions<never, TSchema, TErrorCallbackResult>
	>['errorCallback'],
	e: Extract<ServiceError<TSchema>, { type: ErrorType.UNAUTHORIZED }>
): Promise<{
	success: false;
	error: Awaited<TErrorCallbackResult>;
}> => {
	const result = await errorCallback(e);
	if (e.preventDefaultHandler) {
		return { success: false, error: result };
	}
	return { success: false, error: (await handleUnauthenticatedUser()) as Awaited<TErrorCallbackResult> };
};

export enum ErrorType {
	VALIDATION_ERROR,
	API_ERROR,
	UNKNOWN_ERROR,
	UNAUTHORIZED
}

export type ServiceError<TErrorSchema extends z.AnyZodObject> =
	| {
			type: ErrorType.VALIDATION_ERROR;
			message: ErrorMessage;
			status: number;
			data: z.infer<TErrorSchema>;
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
			type: ErrorType.UNKNOWN_ERROR;
			message: ErrorMessage;
			status: number;
			data: unknown;
			originalError: unknown;
	  }
	| {
			type: ErrorType.UNAUTHORIZED;
			message: ErrorMessage;
			status: number;
			data: unknown;
			preventDefaultHandler: boolean;
			originalError: ResponseError | TokenError;
	  };

export type ServiceCallOptions<
	TServiceCallResult extends Promise<unknown>,
	TErrorSchema extends z.AnyZodObject,
	TErrorCallbackResult extends Promise<unknown>
> = {
	serviceCall: () => TServiceCallResult;
	errorSchema?: TErrorSchema;
	errorCallback?: (e: ServiceError<TErrorSchema>) => TErrorCallbackResult;
};

export async function callService<
	TServiceCallResult extends Promise<unknown>,
	TErrorSchema extends z.AnyZodObject,
	TErrorCallbackResult extends Promise<unknown> = Promise<ServiceError<TErrorSchema>>
>({
	serviceCall,
	errorSchema,
	errorCallback = (async (e) => {
		if (e.type === ErrorType.UNAUTHORIZED) {
			await handleUnauthenticatedUser();
		}
		return e;
	}) as Required<ServiceCallOptions<TServiceCallResult, TErrorSchema, TErrorCallbackResult>>['errorCallback']
}: ServiceCallOptions<TServiceCallResult, TErrorSchema, TErrorCallbackResult>): Promise<
	| {
			success: false;
			error: Awaited<TErrorCallbackResult>;
	  }
	| {
			success: true;
			result: Awaited<TServiceCallResult>;
	  }
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
			const response = await e.response.clone().json();

			if (e.response.status === 401) {
				await _defaultUnAuthenticatedUserHandler(errorCallback, {
					type: ErrorType.UNAUTHORIZED,
					status: e.response.status,
					message: e.message,
					data: response,
					preventDefaultHandler: false,
					originalError: e
				});

				// this solution redirected to logout page no matter what the consumer did
				// return await _handleUnauthenticatedUser(errorCallback, {
				// 	type: ErrorType.UNAUTHORIZED,
				// 	status: e.response.status,
				// 	message: e.message,
				// 	data: response,
				// 	originalError: e
				// });
			}

			const parsedApiError = await errorSchema?.strip().partial().safeParseAsync(response.detail);
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
			return await _defaultUnAuthenticatedUserHandler(errorCallback, {
				type: ErrorType.UNAUTHORIZED,
				status: -1,
				message: e.message,
				data: { detail: 'Invalid token (client-side validations).' },
				preventDefaultHandler: false,
				originalError: e
			});

			// this solution redirected to logout page no matter what the consumer did
			// return await _handleUnauthenticatedUser(errorCallback, {
			// 	type: ErrorType.UNAUTHORIZED,
			// 	status: -1,
			// 	message: e.message,
			// 	data: { detail: 'Invalid token (client-side validations).' },
			// 	originalError: e
			// });
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
