import { fail, type Actions, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import KEYS from '$lib/constants/cookie';
import { OAuthService } from '$lib/client';
import { convertFormDataToObject } from '$lib/enhance/form';
import { schema } from './validators';
import { Body_login_for_access_token } from '$lib/client/zod/schemas';
import { applyAction, callServiceInFormActions } from '$lib/custom-client';
import { ErrorType } from '$lib/custom-client/client.universal';

export const load = (async () => {
	return {};
}) satisfies PageServerLoad;
export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();

		const validationsResult = await schema.safeParseAsync(convertFormDataToObject(formData));
		if (!validationsResult.success) {
			return fail(404, validationsResult.error.flatten().fieldErrors);
		}

		return await callServiceInFormActions({
			serviceCall: async () => {
				const token = await OAuthService.loginForAccessToken(validationsResult.data);
				cookies.set(KEYS.token, JSON.stringify(token), { secure: true, httpOnly: true, path: '/' });
				throw redirect(303, '/user/todos');
			},
			errorCallback: async (e) => {
				if(e.type === ErrorType.UNAUTHORIZED){
					return fail(401, {message: e.data.detail})
				}else if (e.type === ErrorType.VALIDATION_ERROR){
					return fail(0, {message: e.data.username}) //TODO: remove and type should be schema
				//								^?
				}
				return await applyAction(e)
			},
			isTokenRequired: false,
			errorSchema: Body_login_for_access_token
		});
	}
} satisfies Actions;
