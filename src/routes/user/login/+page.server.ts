import { error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { schema } from './validator';

export const load = (async () => {
	return {};
}) satisfies PageServerLoad;

export const actions = {
	default: async ({ cookies, request }) => {
		const formData = await request.formData();
		const user = schema.safeParse({
			username: formData.get('username')
		});

		if (!user.success) {
			throw error(404, {
				message: user.error.message
			});
		}

		cookies.set('username', user.data.username);
		return {
			success: true
		};
	}
} satisfies Actions;
