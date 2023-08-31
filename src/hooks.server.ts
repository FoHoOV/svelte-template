import type { Handle } from '@sveltejs/kit';
import type { Token } from '$lib/client';
import KEYS from '$lib/constants/cookie';
import { OpenAPI, isTokenExpirationDateValidAsync } from './lib';
import { PUBLIC_API_URL } from '$env/static/public';
import { sequence } from '@sveltejs/kit/hooks';

export const setAuthorizationToken: Handle = async ({ event, resolve }) => {
	let token = event.cookies.get(KEYS.token);
	OpenAPI.BASE = PUBLIC_API_URL;

	if (!(await isTokenExpirationDateValidAsync(token))) {
		event.cookies.delete(KEYS.token);
		token = undefined;
	}

	if (token) {
		event.locals.token = JSON.parse(token) as Token;
	}

	OpenAPI.TOKEN = async () => {
		return event.locals.token?.access_token ?? '';
	};

	try {
		return await resolve(event);
	} finally {
		OpenAPI.TOKEN = undefined;
	}
};

export const handle: Handle = sequence(setAuthorizationToken);
