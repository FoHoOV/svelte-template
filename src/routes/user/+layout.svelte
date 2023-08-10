<script lang="ts">
	import user from '$lib/stores/user';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	if (!$user.isLoggedIn && $page.route.id !== '/user/login') {
		goto('/user/login');
	}

	$: if (!$user.isLoggedIn && $page.route.id !== '/user/login') {
		goto('/user/login');
	}
</script>

<slot />
