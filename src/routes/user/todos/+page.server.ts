import { error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load = (async () => {
	return {};
}) satisfies PageServerLoad;

export const actions = {
	default: async ({ cookies, request }) => {
		const formData = await request.formData();

		throw error(403, {
			message: 'form validations failed',
			data: {
				description: 'required'
			}
		});
	}
} satisfies Actions;
