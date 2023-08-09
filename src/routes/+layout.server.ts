import type { LayoutServerLoad } from './$types';

export const load = (async ({ cookies }) => {
	const username = await cookies.get('username');
	return {
		user: {
			username: username,
			isLoggedIn: username !== undefined
		}
	};
}) satisfies LayoutServerLoad;
