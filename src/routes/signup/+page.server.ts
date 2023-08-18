import { fail, type Actions, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { schema } from './validator';
import { ApiError, UserService } from '$lib/client';
import { convertFormDataToObject } from '$lib/form-validator';
import { z } from 'zod';

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
			await UserService.signup({
				username: validationsResult.data.username,
				password: validationsResult.data.password,
				confirm_password: validationsResult.data.confirmPassword
			});
			throw redirect(303, '/user/login');
		} catch (e) {
			// TODO: make this error handing and api calling something generic that everybody can use
			if (e instanceof ApiError) {
				const apiError = await schema
					.innerType()
					.partial()
					.extend({
						username: z.string().optional()
					})
					.safeParseAsync(e.body.detail);
				if (apiError.success) {
					return fail(
						404,
						Object.fromEntries(Object.entries(apiError.data).map(([key, value]) => [key, [value]]))
					);
				}
				return fail(e.status, { message: e.message, data: e.body });
			}
			throw e;
		}
	}
} satisfies Actions;
