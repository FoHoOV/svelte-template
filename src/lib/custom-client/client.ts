import { PUBLIC_API_URL } from '$env/static/public';
import type { ZodObject, ZodRawShape, z } from 'zod';
import { ApiError } from '../client';
import { fail } from '@sveltejs/kit';

export const createRequest = (url: string, token?: string): Request => {
	const request = new Request(url);
	if (token) {
		request.headers.set('Authorization', `bearer: ${token}`);
	}
	return request;
};

type ErrorHandler = <TError>(error: TError) => void;

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

export const getToSvelte = async <TResponse, TError = unknown>(
	endPoint: string,
	data: Record<string, any> = {},
	config: RequestInit = {},
	onError: ErrorHandler | undefined = undefined
) => {
	return genericGet<TResponse, TError>(endPoint, data, config, onError);
};

export const postToExternal = async <TResponse, TError = unknown>(
	endPoint: string,
	data: Record<string, any> = {},
	config: RequestInit = {},
	onError: ErrorHandler | undefined = undefined
) => {
	return genericPost<TResponse, TError>(`${PUBLIC_API_URL}/${endPoint}`, data, config, onError);
};

export const postToSvelte = async <TResponse, TError = unknown>(
	endPoint: string,
	data: Record<string, any> = {},
	config: RequestInit = {},
	onError: ErrorHandler | undefined = undefined
) => {
	return genericPost<TResponse, TError>(endPoint, data, config, onError);
};

export async function callServiceInFormActions<
	TPromiseReturn,
	TZodRawShape extends ZodRawShape,
	TSchema extends ZodObject<TZodRawShape>
>(serviceCall: () => Promise<TPromiseReturn>, errorSchema: TSchema) {
	try {
		return await serviceCall();
	} catch (e) {
		// TODO: make this error handing and api calling something generic that everybody can use
		// other types of errors that are not validation errors should be also handled which is not handled here yet :(
		// the success part is only for validation errors
		// but what if server returns an array of errors for one field! :( // TODO: simulate this
		if (e instanceof ApiError) {
			const parsedApiError = await errorSchema.strip().partial().safeParseAsync(e.body.detail);
			if (parsedApiError.success) {
				return fail(404, parsedApiError.data as z.infer<TSchema>);
			}
			return fail(e.status, { message: e.message, data: e.body });
		}
		//throw e;
	}
}
