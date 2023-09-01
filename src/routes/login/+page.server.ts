import { type Actions, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import KEYS from '$lib/constants/cookie';
import { convertFormDataToObject, superFail } from '$lib/enhance/form';
import { schema } from './validators';
import { Body_login_for_access_token } from '$lib/client/zod/schemas';
import { superApplyAction, callServiceInFormActions } from '$lib/client-wrapper';
import { ErrorType } from '$lib/client-wrapper/wrapper.universal';
import { OAuthClient } from '../../lib/client-wrapper/clients';

export const load = (async () => {
	return {};
}) satisfies PageServerLoad;
export const actions: Actions = {
	default: async ({ request, locals, cookies }) => {
		const formData = await request.formData();

		const validationsResult = await schema.safeParseAsync(convertFormDataToObject(formData));
		if (!validationsResult.success) {
			return superFail(400, {
				message: 'Invalid form, please review your inputs',
				error: validationsResult.error.flatten().fieldErrors
			});
		}

		return await callServiceInFormActions({
			serviceCall: async () => {
				const token = await OAuthClient({
					accessToken: locals.token?.access_token
				}).loginForAccessToken(validationsResult.data);
				cookies.set(KEYS.token, JSON.stringify(token), { secure: true, httpOnly: true, path: '/' });
				throw redirect(303, '/user/todos');
			},
			errorCallback: async (e) => {
				if (e.type === ErrorType.UNAUTHORIZED) {
					return superFail(403, {
						message: (e.data as any).detail as string
					});
				}
				return await superApplyAction(e);
			},
			errorSchema: Body_login_for_access_token
		});
	}
} satisfies Actions;
