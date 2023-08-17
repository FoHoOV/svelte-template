import { error, fail, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import KEYS from '$lib/constants/cookie';
import type { Token } from '$lib/client';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const data = (await request.json()) as Token | undefined;
	if (!data?.access_token) {
		throw error(404, { message: 'data corrupted', data: { token: 'required' } });
	}
	cookies.set(KEYS.token, JSON.stringify(data), { secure: true, httpOnly: true, path: '/' });
	return json({ error: false });
};
