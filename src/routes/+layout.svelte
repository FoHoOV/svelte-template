<script lang="ts">
	import '../app.css';
	import Navbar from '../lib/components/Navbar.svelte';
	import NavbarItem from '../lib/components/NavbarItem.svelte';
</script>

<Navbar appName="Todos" href="/">
	<svelte:fragment slot="center">
		<NavbarItem href="/users/todos" name="list" />
	</svelte:fragment>
	<svelte:fragment slot="end">
		<NavbarItem href="/users/login" name="login" />
	</svelte:fragment>
</Navbar>

<div class="mx-auto px-6">
	<slot />
</div>
