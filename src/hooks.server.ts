import type { Handle } from '@sveltejs/kit';
import type { Token } from '$lib/client';
import KEYS from '$lib/constants/cookie';
import { isTokenExpirationDateValid } from './lib';

export const handle: Handle = async ({ event, resolve }) => {
	let token = event.cookies.get(KEYS.token);

	if(!isTokenExpirationDateValid(token)){
		event.cookies.delete(KEYS.token);
		token = undefined;
	}

	if (token) {
		event.locals.token = JSON.parse(token) as Token;
	}

	return await resolve(event);
};
