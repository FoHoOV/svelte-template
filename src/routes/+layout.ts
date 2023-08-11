import { OpenAPI } from '$lib/client';
import type { LayoutLoad } from './$types';

export const load = (async () => {
	OpenAPI.BASE = import.meta.env.VITE_API_URL;
	return {};
}) satisfies LayoutLoad;
