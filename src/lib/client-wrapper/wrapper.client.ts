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
TServiceCallResult extends Promise<unknown>,
TSchema extends z.AnyZodObject,
TResolvedErrorCallbackResult = ServiceError<TSchema>
>({
	serviceCall,
	errorSchema,
	errorCallback
}: ServiceCallOptions<TServiceCallResult, TSchema, TResolvedErrorCallbackResult>) {
	return await callService({
		serviceCall: serviceCall,
		errorSchema: errorSchema,
		errorCallback: errorCallback
	});
}
