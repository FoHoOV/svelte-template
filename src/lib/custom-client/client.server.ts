import type { z } from 'zod';
import { fail, redirect } from '@sveltejs/kit';
import {
	callService,
	ErrorType,
	type ServiceCallOptions,
	type ServiceError
} from './client.universal';

export async function applyAction<TSchema extends z.AnyZodObject>(e: ServiceError<TSchema>) {
	switch (e.type) {
		case ErrorType.API_ERROR:
			return fail(e.status, { message: e.message, data: e.data });
		case ErrorType.VALIDATION_ERROR:
			return fail(e.status, e.data);
		case ErrorType.UNAUTHORIZED:
			throw redirect(303, '/login');
		default:
			throw e.originalError;
	}
}

export async function callServiceInFormActions<
	TPromiseReturn,
	TErrorCallbackPromiseReturn,
	TSchema extends z.AnyZodObject
>({
	serviceCall,
	isTokenRequired = true,
	errorSchema,
	errorCallback
}: ServiceCallOptions<TPromiseReturn, TErrorCallbackPromiseReturn, TSchema>) {
	const result = await callService({
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

	if (result.success) {
		return result.data;
	} else {
		return result.error;
	}
}
