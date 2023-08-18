import { PUBLIC_API_URL } from '$env/static/public';
import { OpenAPI } from '$lib/client';
import type { LayoutLoad } from './$types';

export const ssr = true;

export const load = (async ({ data }) => {
	OpenAPI.BASE = PUBLIC_API_URL;
	OpenAPI.TOKEN = data.token?.access_token;
	return { token: data.token };
}) satisfies LayoutLoad;
