<script lang="ts">
	import user from '$lib/stores/user';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import type { LayoutRouteId } from '../$types';
	
	const notLoggedInRoutes: LayoutRouteId[] = ['/user/login', '/user/signup'];
	
	const isCurrentRouteProtected=()=>{
		return !notLoggedInRoutes.includes(<any>$page.route.id ?? "");
	}

	$: if (!$user.accessToken && isCurrentRouteProtected()) {
		goto('/user/login');
	}
</script>

<slot />
