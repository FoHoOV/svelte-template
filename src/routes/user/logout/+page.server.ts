import { redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import KEYS from '$lib/constants/cookie';

export const load = (async () => {
	return {};
}) satisfies PageServerLoad;

export const actions = {
	default: async ({ cookies }) => {
		cookies.delete(KEYS.token, { path: '/' });
		throw redirect(303, '/user/login');
	}
} satisfies Actions;
