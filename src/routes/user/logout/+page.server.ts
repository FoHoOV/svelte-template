import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async () => {
	return {};
}) satisfies PageServerLoad;

export const actions = {
	default: async ({ cookies }) => {
		cookies.set('accessToken', '');
        console.log("logged out")
	}
} satisfies Actions;
