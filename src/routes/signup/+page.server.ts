import { fail, type Actions, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ApiError, UserService } from '$lib/client';
import { convertFormDataToObject } from '$lib/form-validator';
import { schema } from './validator';
import { UserCreate } from '$lib/client/zod/schemas';

export const load = (async () => {
	return {};
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();

		const validationsResult = await schema.safeParseAsync(convertFormDataToObject(formData));
		if (!validationsResult.success) {
			return fail(404, validationsResult.error.flatten().fieldErrors);
		}

		try {
			await UserService.signup(validationsResult.data);
			throw redirect(303, '/user/login');
		} catch (e) {
			// TODO: make this error handing and api calling something generic that everybody can use
			// other types of errors that are not validation errors should be also handled which is not handled here yet :(
			// the success part is only for validation errors
			// but what if server returns an array of errors for one field! :( // TODO: simulate this
			if (e instanceof ApiError) {
				const apiError = await UserCreate.strip().partial().safeParseAsync(e.body.detail);
				if (apiError.success) {
					return fail(
						404,
						apiError.data
					);
				}
				return fail(e.status, { message: e.message, data: e.body });
			}
			throw e;
		}
	}
} satisfies Actions;
