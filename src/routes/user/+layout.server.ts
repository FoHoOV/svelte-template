import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ cookies }) => {
	if (cookies.get('accessToken')?.trim().length === 0) {
		throw redirect(307, '/users/login');
	}
	return {};
}) satisfies LayoutServerLoad;
