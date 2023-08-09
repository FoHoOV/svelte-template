import user from '$lib/stores/user';
import type { LayoutLoad } from './$types';

export const load = (async ({ data }) => {
	if (data.user.isLoggedIn && data.user.username) {
		user.login(data.user.username);
	} else {
		user.signOut();
	}
	return {...data};
}) satisfies LayoutLoad;
