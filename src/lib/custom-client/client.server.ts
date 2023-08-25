import type { ZodObject, ZodRawShape } from 'zod';
import { fail, redirect } from '@sveltejs/kit';
import {
	callService,
	ErrorType,
	type ServiceCallOptions,
	type ServiceError
} from './client.universal';

export async function applyAction(e: ServiceError<any, any>) {
	switch (e.type) {
		case (ErrorType.API_ERROR, ErrorType.VALIDATION_ERROR):
			return fail(e.status, { message: e.message, data: e.data });
		case ErrorType.UNAUTHORIZED:
			throw redirect(303, '/login');
		default:
			throw e.original_error;
	}
}

export async function callServiceInFormActions<
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
		errorCallback: async (e) => {
			if (errorCallback) {
				return await errorCallback(e);
			}
			return await applyAction(e);
		}
	});
}
