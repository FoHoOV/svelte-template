import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { convertFormDataToObject, superFail } from '$lib/enhance/form';
import { schema } from './validator';
import { TodoCreate } from '$lib/client/zod/schemas';
import { callService, callServiceInFormActions } from '$lib/client-wrapper';
import { TodoClient } from '$lib/client-wrapper/clients';

export const load = (async ({locals}) => {
	return {
		streamed: {
			todos: callService({
				serviceCall: async () => await TodoClient({accessToken: locals.token?.access_token}).getForUser({
					status: 'all'
				})
			})
		}
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();

		const validationsResult = await schema.safeParseAsync(convertFormDataToObject(formData));
		if (!validationsResult.success) {
			return superFail(400, {
				message: 'Invalid form, please review your inputs',
				error: validationsResult.error.flatten().fieldErrors
			});
		}

		return await callServiceInFormActions({
			serviceCall: async () => {
				return await TodoClient({accessToken: locals.token?.access_token}).createForUser({
					...validationsResult.data
				});
			},
			errorSchema: TodoCreate
		});
	}
} satisfies Actions;
