import type { ZodObject, ZodRawShape, z } from "zod";
import { ApiError } from "$lib/client";
import { fail } from "@sveltejs/kit";

export async function callServiceInFormActions<
	TPromiseReturn,
	TZodRawShape extends ZodRawShape,
	TSchema extends ZodObject<TZodRawShape>
>(serviceCall: () => Promise<TPromiseReturn>, errorSchema: TSchema) {
	try {
		return await serviceCall();
	} catch (e) {
		// TODO: make this error handing and api calling something generic that everybody can use
		// other types of errors that are not validation errors should be also handled which is not handled here yet :(
		// the success part is only for validation errors
		// but what if server returns an array of errors for one field! :( // TODO: simulate this
		if (e instanceof ApiError) {
			const parsedApiError = await errorSchema.strip().partial().safeParseAsync(e.body.detail);
			if (parsedApiError.success) {
				return fail(404, parsedApiError.data as z.infer<TSchema>);
			}
			return fail(e.status, { message: e.message, data: e.body });
		}
		throw e;
	}
}