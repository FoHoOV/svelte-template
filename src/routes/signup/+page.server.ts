import { fail, type Actions, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ApiError, UserService } from '$lib/client';
import { convertFormDataToObject } from '$lib/form-validator';
import { schema } from './validators';
import { UserCreate } from '$lib/client/zod/schemas';
import { callServiceInFormActions } from '$lib/custom-client/client';

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
		return await callServiceInFormActions(async () => {
			await UserService.signup(validationsResult.data);
			throw redirect(303, '/login');
		}, UserCreate);
	}
} satisfies Actions;
