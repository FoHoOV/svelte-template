<script lang="ts">
	import '../app.css';
	import Navbar from '../lib/components/Navbar.svelte';
	import NavbarItem from '../lib/components/NavbarItem.svelte';
</script>

<Navbar appName="Todos" href="/">
	<div slot="center">
		<NavbarItem href="users/todos" name="list" />
	</div>
	<div slot="end">
		<NavbarItem href="/users/login" name="login" />
	</div>
</Navbar>

<div class="mx-auto px-6">
	<slot />
</div>
