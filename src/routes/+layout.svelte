<script lang="ts">
	import '../app.css';
	import Navbar from '$lib/components/navbar/Navbar.svelte';
	import NavbarItem from '$lib/components/navbar/NavbarItem.svelte';
	import user from '$lib/stores/user';
	import type { LayoutData } from './$types';
	import { navigating } from '$app/stores';

	export let data: LayoutData;
</script>

<Navbar appName="Todos" href="/user/todos">
	<svelte:fragment slot="center">
		<NavbarItem href="/" name="home" />
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
	{#if $navigating}
		<span
			class="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 loading loading-ball loading-lg"
		/>
	{:else}
		<slot />
	{/if}
</div>
