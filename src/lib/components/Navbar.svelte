<script lang="ts">
	import Fa from 'svelte-fa/src/fa.svelte';
	export let appName: string;
	export let href: string;
</script>

<div class="navbar bg-base-100">
	<div class="navbar-start">
		<a class="btn btn-ghost normal-case text-xl" {href}>{appName}</a>
	</div>
	<div class="navbar-center hidden lg:flex">
		<ul class="menu menu-horizontal px-1">
			<slot name="center" />
		</ul>
	</div>
	<div class="navbar-end">
		<slot name="end" />
	</div>
</div>
