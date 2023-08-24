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
	TZodRawShape extends ZodRawShape,
	TSchema extends (ZodObject<TZodRawShape>),
	TErrorCallbackReturn
> = {
	serviceCall: () => Promise<TPromiseReturn>;
	errorSchema?: TSchema;
	errorCallback?: (e: ErrorType<any | z.infer<TSchema>>) => TErrorCallbackReturn
};

export async function callServiceInClient<
	TPromiseReturn,
	TZodRawShape extends ZodRawShape,
	TSchema extends ZodObject<TZodRawShape>,
	TErrorCallbackReturn
>({ serviceCall, errorSchema, errorCallback }: ClientServiceCallOptions<TPromiseReturn, TZodRawShape, TSchema, TErrorCallbackReturn>) {
	return await callService({
		serviceCall: serviceCall,
		errorCallback: async (e) => {
			throw e;
			// if (e instanceof ApiError) {
			// 	const parsedApiError = await errorSchema?.strip().partial().safeParseAsync(e.body.detail);
			// 	if (parsedApiError?.success && errorCallback) {
			// 		return errorCallback({
			// 			type: 'validation error',
			// 			status: e.status,
			// 			message: e.message,
			// 			data: parsedApiError.data
			// 		});
			// 	}

			// 	return Promise.reje({
			// 		type: 'an unknown error has occurred',
			// 		status: e.status,
			// 		message: e.message,
			// 		data: e.body
			// 	});
			// }
			// throw e;
		}
	});
}
