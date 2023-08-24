import type { ZodObject, ZodRawShape, z } from 'zod';
import { ApiError } from '$lib/client';
import { fail } from '@sveltejs/kit';
import { callService } from './client.universal';

export type FormActionsServiceCallOptions<
	TPromiseReturn,
	TZodRawShape extends ZodRawShape,
	TSchema extends ZodObject<TZodRawShape>
> = {
	serviceCall: () => Promise<TPromiseReturn>;
	errorSchema: TSchema;
	isTokenRequired?: boolean;
};
export async function callServiceInFormActions<
	TPromiseReturn,
	TZodRawShape extends ZodRawShape,
	TSchema extends ZodObject<TZodRawShape>
>({
	serviceCall,
	errorSchema,
	isTokenRequired = true,
}: FormActionsServiceCallOptions<TPromiseReturn, TZodRawShape, TSchema>) {
	return await callService({
		serviceCall: serviceCall,
		isTokenRequired: isTokenRequired,
		errorCallback: async (e) => {
			if (e instanceof ApiError) {
				const parsedApiError = await errorSchema.strip().partial().safeParseAsync(e.body.detail);
				if (parsedApiError.success) {
					return fail(404, parsedApiError.data as z.infer<TSchema>);
				}
				return fail(e.status, { message: e.message, data: e.body });
			}
			throw e;
		}
	});
}
