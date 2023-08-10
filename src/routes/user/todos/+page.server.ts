import { error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { z } from 'zod';
import { schema } from './validator';

export const load = (async () => {
	return {};
}) satisfies PageServerLoad;

export const actions = {
	default: async ({ cookies, request }) => {
		const formData = await request.formData();
		const validationsResult = schema.safeParse(Object.fromEntries(formData.entries()));

		if(!validationsResult.success) {
			console.log(validationsResult.error.flatten().fieldErrors);
			throw error(403, {
				message: 'form validations failed',
				data: validationsResult.error.flatten().fieldErrors
			});
		}
		
		
	}
} satisfies Actions;
