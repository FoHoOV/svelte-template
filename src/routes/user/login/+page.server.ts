import { fail, type Actions, error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { schema } from './validator';
import KEYS from '$lib/constants/cookie';
import { ApiError, OAuthService } from '$lib/client';

export const load = (async () => {
	return {};
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();

		const validationsResult = await schema.safeParseAsync(formData);
		if (!validationsResult.success) {
			return fail(404, validationsResult.error.flatten().fieldErrors);
		}

		try {
			const token = await OAuthService.loginForAccessToken(validationsResult.data);
			cookies.set(KEYS.token, JSON.stringify(token), { secure: true, httpOnly: true, path: '/' });
            throw redirect(303, "/user/todos");
		} catch (e) {
			if (e instanceof ApiError) {
				throw error(e.status, { message: e.message, data: e.body });
			}
			throw e;
		}
	}
} satisfies Actions;
