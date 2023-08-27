import type { z } from 'zod';
import { fail, redirect } from '@sveltejs/kit';
import {
	callService,
	ErrorType,
	type ServiceCallOptions,
	type ServiceError
} from './client.universal';
import { superFail } from '$lib/enhance';

export async function applyAction<TSchema extends z.AnyZodObject>(e: ServiceError<TSchema>) {
	switch (e.type) {
		case ErrorType.API_ERROR:
			return superFail(404, {
				message: e.message,
				data: e.data as unknown // TODO: enable this
			});
		case ErrorType.VALIDATION_ERROR:
			return superFail(400, { message: e.message, data: e.data });
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
	errorCallback = undefined
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
	return result;
	// if (result.success) {
	// 	return result.data;
	// } else {
	// 	return result.error;
	// }
}
