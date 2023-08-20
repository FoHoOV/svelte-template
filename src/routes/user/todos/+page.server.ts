import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { TodoService } from '$lib/client';
import { convertFormDataToObject } from '$lib/enhance/form';
import { schema } from './validator';
import { TodoCreate } from '$lib/client/zod/schemas';
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
			const newTodo = await TodoService.createForUser({
				...validationsResult.data
			});
			return {
				todo: newTodo
			};
		}, TodoCreate);
	}
} satisfies Actions;
