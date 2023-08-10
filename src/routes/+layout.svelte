<script lang="ts">
	import '../app.css';
	import Navbar from '../lib/components/Navbar.svelte';
	import NavbarItem from '../lib/components/NavbarItem.svelte';
	import user from '../lib/stores/user';
	import type { LayoutData } from './$types';

	export let data: LayoutData;
</script>

<Navbar appName="Todos" href="/">
	<svelte:fragment slot="center">
		<NavbarItem href="/user/todos" name="list" />
	</svelte:fragment>
	<svelte:fragment slot="end">
		{#if data.user.isLoggedIn && $user.isLoggedIn}
			<NavbarItem href="/user/logout" name="logout" />
		{:else}
			<NavbarItem href="/user/login" name="login" />
		{/if}
	</svelte:fragment>
</Navbar>
<div class="mx-auto px-6 pt-6">
	<slot />
</div>
