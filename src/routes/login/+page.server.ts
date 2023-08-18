import { fail, type Actions, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import KEYS from '$lib/constants/cookie';
import { ApiError, OAuthService } from '$lib/client';
import { convertFormDataToObject } from '$lib/form-validator';
import { Body_login_for_access_token } from '$lib/client/zod/schemas';

export const load = (async () => {
	return {};
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();

		const validationsResult = await Body_login_for_access_token.strip().safeParseAsync(convertFormDataToObject(formData));
		if (!validationsResult.success) {
			return fail(404, validationsResult.error.flatten().fieldErrors);
		}

		try {
			const token = await OAuthService.loginForAccessToken(validationsResult.data);
			cookies.set(KEYS.token, JSON.stringify(token), { secure: true, httpOnly: true, path: '/' });
			throw redirect(303, '/user/todos');
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { message: e.message, data: e.body });
			}
			throw e;
		}
	}
} satisfies Actions;
