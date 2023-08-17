import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { OAuthService } from '$lib/client';
import KEYS from '$lib/constants/cookie';

export const load = (async () => {
	return {};
}) satisfies PageServerLoad;

export const actions = {
	default: async ({ cookies, request }) => {
		const data = await request.formData();
		const token = await OAuthService.loginForAccessToken({
			username: data.get('username') as string,
			password: data.get('password') as string
		});

		cookies.set(KEYS.token, JSON.stringify(token), { path: '/', httpOnly: true });
	}
} satisfies Actions;
