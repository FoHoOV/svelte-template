import type { Handle } from '@sveltejs/kit';
import type { Token } from '$lib/client';
import KEYS from '$lib/constants/cookie';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get(KEYS.token);

	if (token) {
		event.locals.token = JSON.parse(token) as Token;
	}

	return await resolve(event);
};
