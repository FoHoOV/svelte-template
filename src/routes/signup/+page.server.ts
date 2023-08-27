import { fail, type Actions, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { UserService } from '$lib/client';
import { convertFormDataToObject, superFail } from '$lib/enhance/form';
import { schema } from './validators';
import { UserCreate } from '$lib/client/zod/schemas';
import { callServiceInFormActions } from '$lib/custom-client';

export const load = (async () => {
	return {};
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();

		const validationsResult = await schema.safeParseAsync(convertFormDataToObject(formData));
		if (!validationsResult.success) {
			return superFail(400, {
				message: 'Invalid form, please review your inputs',
				data: validationsResult.error.flatten().fieldErrors
			});
		}

		const a = await callServiceInFormActions({
			serviceCall: async () => {
				await UserService.signup(validationsResult.data);
				throw redirect(303, '/login');
			},
			isTokenRequired: false,
			errorSchema: UserCreate
		});
		type z = typeof a;
		//   ^?
		return await callServiceInFormActions({
			serviceCall: async () => {
				await UserService.signup(validationsResult.data);
				throw redirect(303, '/login');
			},
			isTokenRequired: false,
			errorSchema: UserCreate
		});
	}
} satisfies Actions;
