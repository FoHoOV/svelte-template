import type { z } from 'zod';
import {
	callService,
	ErrorType,
	handleUnauthenticatedUser,
	type ErrorCallbackType,
	type ServiceCallOptions,
	type ServiceError
} from './wrapper.universal';
import { superFail } from '$lib/enhance';
import type { RequiredProperty } from '../utils';

export async function superApplyAction<TErrorSchema extends z.AnyZodObject>(
	e: ServiceError<TErrorSchema>
) {
	switch (e.type) {
		case ErrorType.API_ERROR:
			return superFail(404, {
				message: e.message,
				error: e.response as never
			});
		case ErrorType.VALIDATION_ERROR:
			return superFail(400, { message: e.message, error: e.validationError });
		case ErrorType.UNAUTHORIZED:
			return await handleUnauthenticatedUser();
		default:
			throw e.originalError;
	}
}

export async function callServiceInFormActions<
	TServiceCallResult extends Promise<unknown>,
	TErrorSchema extends z.AnyZodObject,
	TErrorCallbackResult extends Promise<unknown> = ReturnType<typeof superApplyAction<TErrorSchema>>
>({
	serviceCall,
	errorCallback = (async (e) => {
		return await superApplyAction(e);
	}) as ErrorCallbackType<TErrorSchema, TErrorCallbackResult>,
	errorSchema
}: ServiceCallOptions<TServiceCallResult, TErrorSchema, TErrorCallbackResult>): Promise<
	{ success: true; result: Awaited<TServiceCallResult> } | Awaited<TErrorCallbackResult>
> {
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
