import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async () => {
	return {};
}) satisfies PageServerLoad;

export const actions = {
	default: async ({ cookies }) => {
		cookies.set('username', '');
        console.log("logged out")
		return { success: true };
	}
} satisfies Actions;
