import type { ZodRawShape, z } from 'zod';
import {
	genericGet,
	type ErrorHandler,
	genericPost,
	type ServiceCallOptions,
	callService,
	type ServiceError
} from './wrapper.universal';

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

export async function callServiceInClient<
	TPromiseReturn,
	TSchema extends z.AnyZodObject,
	TErrorCallbackReturn = ServiceError<TSchema>
>({
	serviceCall,
	errorSchema,
	errorCallback
}: ServiceCallOptions<TPromiseReturn, TSchema, TErrorCallbackReturn>) {
	return await callService({
		serviceCall: serviceCall,
		errorSchema: errorSchema,
		errorCallback: errorCallback
	});
}
