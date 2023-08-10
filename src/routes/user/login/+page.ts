import type { Actions } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load = (async ({parent}) => {
	const { user } = await parent();
	return {};
}) satisfies PageLoad;

