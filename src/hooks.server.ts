import type { Handle } from '@sveltejs/kit';
import type { Token } from '$lib/client';
import KEYS from '$lib/constants/cookie';
import { sequence } from '@sveltejs/kit/hooks';
import { isTokenExpirationDateValidAsync } from './lib/client-wrapper/clients';

export const setAuthorizationToken: Handle = async ({ event, resolve }) => {
	let token = event.cookies.get(KEYS.token);

	if (token && !(await isTokenExpirationDateValidAsync(token))) {
		event.cookies.delete(KEYS.token);
		token = undefined;
	}

	if (token) {
		event.locals.token = JSON.parse(token) as Token;
	}

	return await resolve(event);
};

export const handle: Handle = sequence(setAuthorizationToken);
