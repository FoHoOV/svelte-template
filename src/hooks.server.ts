import { redirect, type Handle } from '@sveltejs/kit';
import type { Token } from '$lib/client';
import KEYS from '$lib/constants/cookie';
import { isRouteProtected } from '$lib/protected-routes';

export const handle: Handle = async ({ event, resolve }) => {
	console.log('ran global handle hook');
	const token = event.cookies.get(KEYS.token);
	
	if (token) {
		event.locals.token = JSON.parse(token) as Token;
	} else if (isRouteProtected(event.route.id)) {
		throw redirect(303, '/user/login');
	}

	return await resolve(event);
};
