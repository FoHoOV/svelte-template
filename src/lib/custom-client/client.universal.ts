import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { PUBLIC_API_URL } from '$env/static/public';
import { redirect } from '@sveltejs/kit';
import { ApiError, OpenAPI } from '../client';
import { decodeJwt, type JWTPayload } from 'jose';
import type { ApiRequestOptions } from '../client/core/ApiRequestOptions';

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
	TErrorCallbackReturn = never,
	TUnAuthorizedCallbackReturn = never
> = {
	serviceCall: () => Promise<TPromiseReturn>;
	errorCallback?: (e: unknown) => TErrorCallbackReturn;
	unAuthorizedCallback?: () => TUnAuthorizedCallbackReturn;
	isTokenRequired?: boolean;
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

export async function callServiceUniversal<
	TPromiseReturn,
	TErrorCallbackReturn = never,
	TUnAuthorizedCallbackReturn = never
>({
	serviceCall,
	unAuthorizedCallback,
	errorCallback,
	isTokenRequired = true
}: ServiceCallOptions<TPromiseReturn, TErrorCallbackReturn, TUnAuthorizedCallbackReturn>) {
	if (isTokenRequired && !(await isTokenExpirationDateValidAsync(OpenAPI.TOKEN))) {
		OpenAPI.TOKEN = undefined;
		if (unAuthorizedCallback) {
			return unAuthorizedCallback();
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
		if (e instanceof ApiError && e.status === 401) {
			if (unAuthorizedCallback) {
				return unAuthorizedCallback();
			}
			if (browser) {
				goto('/login');
			} else {
				throw redirect(303, '/login');
			}
		}
		if (errorCallback) {
			return errorCallback(e);
		}
		throw e;
	}
}
