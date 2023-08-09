<script lang="ts">
	import Fa from 'svelte-fa/src/fa.svelte';
	import { faBarsStaggered } from '@fortawesome/free-solid-svg-icons';
	export let appName: string;
	export let href: string;
</script>

<div class="navbar shadow-2xl bg-base-100">
	<div class="navbar-start">
		<div class="dropdown">
			<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label tabindex="0" class="btn btn-ghost lg:hidden">
				<Fa icon={faBarsStaggered} />
			</label>
			<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
			<ul
				tabindex="0"
				class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-2xl bg-base-100 rounded-box w-52"
			>
				<slot name="center" />
			</ul>
		</div>
		<a class="btn btn-ghost normal-case text-xl" {href}>{appName}</a>
	</div>
	<div class="navbar-center hidden lg:flex">
		<ul class="menu menu-horizontal px-1">
			<slot name="center" />
		</ul>
	</div>
	<div class="navbar-end">
		<ul class="menu px-1">
			<slot name="end" />
		</ul>
	</div>
</div>
