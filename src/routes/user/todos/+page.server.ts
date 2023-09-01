import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { TodoService } from '$lib/client';
import { convertFormDataToObject, superFail } from '$lib/enhance/form';
import { schema } from './validator';
import { TodoCreate } from '$lib/client/zod/schemas';
import { callService, callServiceInFormActions } from '$lib/custom-client';

export const load = (async () => {
	return {
		streamed: {
			todos: callService({
				serviceCall: async () => await TodoService.getForUser()
			})
		}
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async ({ request }) => {
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
				return await TodoService.createForUser({
					...validationsResult.data
				});
			},
			errorSchema: TodoCreate
		});
	}
} satisfies Actions;
