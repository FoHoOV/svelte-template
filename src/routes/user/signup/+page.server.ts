import { error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { schema } from './validator';

export const load = (async () => {
	return {};
}) satisfies PageServerLoad;

export const actions = {
	default: async ({ cookies, request }) => {
		const formData = await request.formData();
		const validationsResult = schema.safeParse(Object.fromEntries(formData.entries()));

		if (!validationsResult.success) {
			console.log(validationsResult.error.flatten().fieldErrors);
			throw error(403, {
				message: 'form validations failed',
				data: validationsResult.error.flatten().fieldErrors
			});
		}
		const res = await fetch(`${import.meta.env.VITE_API_URL}/user/signup`, {
			method: 'post',
			body: JSON.stringify(validationsResult.data),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		const json = await res.json();
		if (!res.ok) {
			throw error(404, {
				message: 'Some errors has occurred',
				data: json.detail
			});
		}
	}
} satisfies Actions;
