<script lang="ts">
	import user from '$lib/stores/user';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import type { LayoutRouteId } from './$types';
	import { browser } from '$app/environment';

	const notLoggedInRoutes: LayoutRouteId[] = ['/user/login', '/user/signup'];

	const isCurrentRouteProtected = () => {
		return !notLoggedInRoutes.includes(<any>$page.route.id ?? '');
	};

	// TODO: this has a flicker to it!
	$: if (browser && !$user?.access_token && isCurrentRouteProtected()) {
		goto('/user/login');
	}
</script>

<slot />
