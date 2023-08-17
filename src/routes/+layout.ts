import { PUBLIC_API_URL } from '$env/static/public';
import { OpenAPI } from '$lib/client';
import KEYS from '$lib/constants/cookie';
import type { LayoutLoad } from './$types';

export const ssr = true; // NOTE: setting this to false renders the correct data on page load.

export const load = (async ({ data }) => {
	OpenAPI.BASE = PUBLIC_API_URL;
	OpenAPI.TOKEN = data.token?.access_token;
	return { token: data.token };
}) satisfies LayoutLoad;
