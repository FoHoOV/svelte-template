<script lang="ts">
	import user from '$lib/stores/user';
	import { navigating, page } from '$app/stores';
	import { beforeNavigate, goto } from '$app/navigation';
	import { isRouteProtected } from './protected-routes';
	import { browser } from '$app/environment';

	if (browser && isRouteProtected($page.route.id ?? '') && !$user?.access_token) {
		console.log('ran layout check');
		console.log($page.route.id);
		goto('/user/login');
		console.log($navigating);
	}
	
	console.log('ran layout');
</script>

<slot />
