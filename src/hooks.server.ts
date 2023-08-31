import type { Handle } from '@sveltejs/kit';
import type { Token } from '$lib/client';
import KEYS from '$lib/constants/cookie';
import { OpenAPI, isTokenExpirationDateValidAsync } from './lib';

export const handle: Handle = async ({ event, resolve }) => {
	let token = event.cookies.get(KEYS.token);

	if(!await isTokenExpirationDateValidAsync(token)){
		event.cookies.delete(KEYS.token);
		token = undefined;
	}

	if (token) {
		event.locals.token = JSON.parse(token) as Token;
		OpenAPI.TOKEN = async () => event.locals.token?.access_token ?? ''; 
	}

	return await resolve(event);
};
