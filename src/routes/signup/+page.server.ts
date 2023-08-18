import { fail, type Actions, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ApiError, UserService } from '$lib/client';
import { convertFormDataToObject } from '$lib/form-validator';
import { UserCreate } from '$lib/client/zod/schemas';

export const load = (async () => {
	return {};
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();

		const validationsResult = await UserCreate.strip().safeParseAsync(convertFormDataToObject(formData));
		if (!validationsResult.success) {
			return fail(404, validationsResult.error.flatten().fieldErrors);
		}

		try {
			await UserService.signup(validationsResult.data);
			throw redirect(303, '/user/login');
		} catch (e) {
			// TODO: make this error handing and api calling something generic that everybody can use
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
