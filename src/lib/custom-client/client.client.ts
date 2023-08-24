import type { ZodRawShape, ZodObject, z } from 'zod';
import { ApiError } from '../client';
import {
	genericGet,
	type ErrorHandler,
	genericPost,
	callServiceUniversal,
	type ServiceCallOptions
} from './client.universal';

export const getToSvelte = async <TResponse, TError = unknown>(
	endPoint: string,
	data: Record<string, any> = {},
	config: RequestInit = {},
	onError: ErrorHandler | undefined = undefined
) => {
	return genericGet<TResponse, TError>(endPoint, data, config, onError);
};

export const postToSvelte = async <TResponse, TError = unknown>(
	endPoint: string,
	data: Record<string, any> = {},
	config: RequestInit = {},
	onError: ErrorHandler | undefined = undefined
) => {
	return genericPost<TResponse, TError>(endPoint, data, config, onError);
};

export type ErrorType<TData> = {
	type: string;
	message: string;
	status: number;
	data: TData;
};

export type ClientServiceCallOptions<
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
		: (e: ErrorType<any | z.infer<TSchema>>) => TErrorCallbackReturn;
};

export async function callServiceInClient<TPromiseReturn>({
	serviceCall,
	isTokenRequired = true
}: ClientServiceCallOptions<TPromiseReturn, never, never, never>): Promise<TPromiseReturn>;
export async function callServiceInClient<TPromiseReturn, TErrorCallbackReturn>({
	serviceCall,
	isTokenRequired = true,
	errorCallback: TErrorCallbackReturn
}: ClientServiceCallOptions<
	TPromiseReturn,
	never,
	never,
	TErrorCallbackReturn
>): Promise<TPromiseReturn>;
export async function callServiceInClient<
	TPromiseReturn,
	TZodRawShape extends ZodRawShape,
	TSchema extends ZodObject<TZodRawShape>,
	TErrorCallbackReturn
>({
	serviceCall,
	isTokenRequired = true,
	errorSchema,
	errorCallback
}: ClientServiceCallOptions<TPromiseReturn, TZodRawShape, TSchema, TErrorCallbackReturn>) {
	return await callServiceUniversal({
		serviceCall: serviceCall,
		isTokenRequired: isTokenRequired,
		errorCallback: async (e) => {
			let error;
			if (e instanceof ApiError) {
				const parsedApiError = await errorSchema?.strip().partial().safeParseAsync(e.body.detail);
				if (parsedApiError?.success) {
					error = {
						type: 'validation error',
						status: e.status,
						message: e.message,
						data: parsedApiError.data
					};
					if (errorCallback) {
						return errorCallback(error);
					}
					Promise.reject(error);
				}

				error = {
					type: 'some errors has occurred',
					status: e.status,
					message: e.message,
					data: e.body
				};
				if (errorCallback) {
					return errorCallback(error);
				}
				Promise.reject(error);
			}

			error = {
				type: 'some errors has occurred',
				status: -1,
				message: 'some errors has occurred',
				data: e
			};
			if (errorCallback) {
				return errorCallback(error);
			}

			Promise.reject(error);
		}
	});
}
