import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { convertFormDataToObject, superFail } from '$lib/enhance/form';
import { schema } from './validator';
import { TodoCreate } from '$lib/client/zod/schemas';
import { callServiceInFormActions } from '$lib/client-wrapper';
import { TodoClient } from '$lib/client-wrapper/clients';

export const load = (async ({ locals }) => {
	// https://github.com/sveltejs/kit/issues/9785
	// if we reject or throw a redirect in streamed promises it doesn't work for now
	// we have to wait for a fix :()
	// return {
	// 	streamed: {
	// 		todos: callService({
	// 			serviceCall: async () => await TodoClient({accessToken: locals.token?.access_token}).getForUser('all')
	// 		})
	// 	}
	// };
	return {};
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

		// if we return this by storing it in a value then the typings of ActionData will be correct
		const a = await callServiceInFormActions({
			serviceCall: async () => {
				return await TodoClient({ token: locals.token }).createForUser({
					...validationsResult.data
				});
			},
			errorSchema: TodoCreate
		});
		return a;

		// if we return like this then in +page.svelte the type of ActionData is `{} | null`
		// return await callServiceInFormActions({
		// 	serviceCall: async () => {
		// 		return await TodoClient({ token: locals.token }).createForUser({
		// 			...validationsResult.data
		// 		});
		// 	},
		// 	errorSchema: TodoCreate
		// });
	}
} satisfies Actions;
