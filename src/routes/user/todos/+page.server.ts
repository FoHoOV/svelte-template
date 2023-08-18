import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ApiError,TodoService } from '$lib/client';
import { convertFormDataToObject } from '$lib/form-validator';
import { TodoCreate } from '$lib/client/zod/schemas';

export const load = (async () => {
	return {};
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();

		const validationsResult = await TodoCreate.strip().safeParseAsync(convertFormDataToObject(formData));
		if (!validationsResult.success) {
			return fail(404, validationsResult.error.flatten().fieldErrors);
		}

		try {
			const newTodo = await TodoService.createForUser({
				...validationsResult.data,
				is_done: false
			});
			return {
				todo: newTodo
			};
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { message: e.message, data: e.body });
			}
			throw e;
		}
	}
} satisfies Actions;
