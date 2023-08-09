<script lang="ts">
	import '../app.css';
	import Navbar from '../lib/components/Navbar.svelte';
	import NavbarItem from '../lib/components/NavbarItem.svelte';
</script>

<Navbar appName="Todos" href="/">
	<slot name="center">
		<NavbarItem href="users/todos" name="list" />
	</slot>
	<slot name="end">
		<NavbarItem href="/users/login" name="login" />
	</slot>
</Navbar>
<slot />
