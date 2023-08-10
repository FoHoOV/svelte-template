import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const load = (async ({ parent, route }) => {
	const { user } = await parent();

	if (!user.isLoggedIn && route.id !== '/user/login') {
		throw redirect(307, '/user/login');
	}
	return {};
}) satisfies LayoutLoad;
