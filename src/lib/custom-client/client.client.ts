import type { ZodRawShape, ZodObject } from 'zod';
import {
	genericGet,
	type ErrorHandler,
	genericPost,
	type ServiceCallOptions,
	callService
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
}: ServiceCallOptions<TPromiseReturn, TZodRawShape, TSchema, TErrorCallbackReturn>) {
	return await callService({
		serviceCall: serviceCall,
		isTokenRequired: isTokenRequired,
		errorSchema: errorSchema,
		errorCallback: errorCallback
	})
}
