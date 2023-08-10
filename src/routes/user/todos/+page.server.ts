import { error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load = (async () => {
	return {};
}) satisfies PageServerLoad;

export const actions = {
	default: async ({ cookies, request }) => {
		throw error(403, {
			message: {
				description: 'required'
			}
		});
	}
} satisfies Actions;
