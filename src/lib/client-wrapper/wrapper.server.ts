import type { z } from 'zod';
import {
	callService,
	ErrorType,
	handleUnauthenticatedUser,
	type ServiceCallOptions,
	type ServiceError
} from './wrapper.universal';
import { superFail } from '$lib/enhance';
import type { RequiredProperty } from '../utils';

export async function superApplyAction<TSchema extends z.AnyZodObject>(e: ServiceError<TSchema>) {
	switch (e.type) {
		case ErrorType.API_ERROR:
			return superFail(404, {
				message: e.message,
				error: e.data as never
			});
		case ErrorType.VALIDATION_ERROR:
			return superFail(400, { message: e.message, error: e.data });
		case ErrorType.UNAUTHORIZED:
			return await handleUnauthenticatedUser();
		default:
			throw e.originalError;
	}
}

export async function callServiceInFormActions<TPromiseReturn, TSchema extends z.AnyZodObject>({
	serviceCall,
	errorSchema
}: ServiceCallOptions<
	TPromiseReturn,
	TSchema,
	Awaited<ReturnType<typeof superApplyAction<TSchema>>>
>): Promise<
	| { success: true; result: Awaited<TPromiseReturn>; error: never }
	| Awaited<ReturnType<typeof superApplyAction<TSchema>>>
>;
export async function callServiceInFormActions<
	TPromiseReturn,
	TSchema extends z.AnyZodObject,
	TErrorCallbackReturn
>({
	serviceCall,
	errorSchema,
	errorCallback
}: RequiredProperty<
	ServiceCallOptions<TPromiseReturn, TSchema, TErrorCallbackReturn>,
	'errorCallback'
>): Promise<
	{ success: true; result: Awaited<TPromiseReturn>; error: never } | TErrorCallbackReturn
>;
export async function callServiceInFormActions<
	TPromiseReturn,
	TSchema extends z.AnyZodObject,
	TErrorCallbackReturn
>({
	serviceCall,
	errorSchema,
	errorCallback = async (e) => {
		return await superApplyAction(e);
	}
}: ServiceCallOptions<
	TPromiseReturn,
	TSchema,
	TErrorCallbackReturn | Awaited<ReturnType<typeof superApplyAction<TSchema>>>
>) {
	const result = await callService({
		serviceCall: serviceCall,
		errorSchema: errorSchema,
		errorCallback: errorCallback
	});

	if (!result.success) {
		return result.error;
	} else {
		return result;
	}
}
