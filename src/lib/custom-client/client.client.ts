import type { ZodRawShape, ZodObject, z } from 'zod';
import { ApiError } from '../client';
import {
	genericGet,
	type ErrorHandler,
	genericPost,
	callService,
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
	errorCallback?: TErrorCallbackReturn extends never
		? never
		: (e: ErrorType<any | z.infer<TSchema>>) => TErrorCallbackReturn;
};

export async function callServiceInClient<TPromiseReturn>({
	serviceCall
}: ClientServiceCallOptions<TPromiseReturn, never, never, never>): Promise<TPromiseReturn>;
export async function callServiceInClient<TPromiseReturn, TErrorCallbackReturn>({
	serviceCall,
	errorCallback: TErrorCallbackReturn
}: ClientServiceCallOptions<TPromiseReturn, never, never, TErrorCallbackReturn>): Promise<TPromiseReturn>;
export async function callServiceInClient<
	TPromiseReturn,
	TZodRawShape extends ZodRawShape,
	TSchema extends ZodObject<TZodRawShape>,
	TErrorCallbackReturn
>({
	serviceCall,
	errorSchema,
	errorCallback
}: ClientServiceCallOptions<TPromiseReturn, TZodRawShape, TSchema, TErrorCallbackReturn>) {
	return await callService({
		serviceCall: serviceCall,
		errorCallback: async (e) => {
			if (e instanceof ApiError && errorCallback) {
				const parsedApiError = await errorSchema?.strip().partial().safeParseAsync(e.body.detail);
				if (parsedApiError?.success) {
					return errorCallback({
						type: 'validation error',
						status: e.status,
						message: e.message,
						data: parsedApiError.data
					});
				}

				return errorCallback({
					type: 'some errors has occurred',
					status: e.status,
					message: e.message,
					data: e.body
				});
			}

			if (errorCallback) {
				return errorCallback({
					type: 'some errors has occurred',
					status: -1,
					message: 'some errors has occurred',
					data: e
				});
			}

			throw e;
		}
	});
}
