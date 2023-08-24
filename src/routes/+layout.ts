import { browser } from '$app/environment';
import { PUBLIC_API_URL } from '$env/static/public';
import { OpenAPI } from '$lib/client';
import type { LayoutLoad } from './$types';

export const ssr = true;

export const load = (async ({ data }) => {
	OpenAPI.BASE = PUBLIC_API_URL;
	OpenAPI.TOKEN = async () => data.token?.access_token ?? ''; // TODO: we are setting a global variable here which is wrong, what if we support multiple request at the same time
	return { token: data.token };
}) satisfies LayoutLoad;
