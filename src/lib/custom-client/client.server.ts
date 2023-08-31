import type { z } from 'zod';
import { redirect } from '@sveltejs/kit';
import {
	callService,
	ErrorType,
	type ServiceCallOptions,
	type ServiceError
} from './client.universal';
import { superFail } from '$lib/enhance';
import type { RequiredProperty } from '../utils';

export async function applyAction<TSchema extends z.AnyZodObject>(e: ServiceError<TSchema>) {
	switch (e.type) {
		// case ErrorType.API_ERROR:
		// 	return superFail(404, {
		// 		message: e.message,
		// 		data: e.data as unknown // TODO: enable this
		// 	});
		case ErrorType.VALIDATION_ERROR:
			return superFail(400, { message: e.message, error: e.data });
		case ErrorType.UNAUTHORIZED:
			throw redirect(303, '/login');
		default:
			throw e.originalError;
	}
}


export async function callServiceInFormActions<TPromiseReturn, TSchema extends z.AnyZodObject>({
	serviceCall,
	isTokenRequired = true,
	errorSchema
}: Omit<
	ServiceCallOptions<TPromiseReturn, TSchema, Awaited<ReturnType<typeof applyAction<TSchema>>>>,
	'errorCallback'
>): Promise<
	| { success: true; result: Awaited<TPromiseReturn>; error: undefined }
	| Awaited<ReturnType<typeof applyAction<TSchema>>>
>;
export async function callServiceInFormActions<
	TPromiseReturn,
	TSchema extends z.AnyZodObject,
	TErrorCallbackReturn
>({
	serviceCall,
	isTokenRequired = true,
	errorSchema,
	errorCallback
}: RequiredProperty<
	ServiceCallOptions<TPromiseReturn, TSchema, TErrorCallbackReturn>,
	'errorCallback'
>): Promise<
	{ success: true; result: Awaited<TPromiseReturn>; error: undefined } | TErrorCallbackReturn
>;
export async function callServiceInFormActions<
	TPromiseReturn,
	TSchema extends z.AnyZodObject,
	TErrorCallbackReturn = never
>({
	serviceCall,
	isTokenRequired = true,
	errorSchema,
	errorCallback = async (e) => {
		return await applyAction(e);
	}
}: ServiceCallOptions<
	TPromiseReturn,
	TSchema,
	TErrorCallbackReturn | Awaited<ReturnType<typeof applyAction<TSchema>>>
>) {
	const result = await callService({
		serviceCall: serviceCall,
		isTokenRequired: isTokenRequired,
		errorSchema: errorSchema,
		errorCallback: errorCallback
	});

	if (!result.success) {
		return result.error;
	} else {
		return result;
	}
}
