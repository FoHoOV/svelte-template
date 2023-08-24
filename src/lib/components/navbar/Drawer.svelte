<script lang="ts">
	import { faBarsStaggered } from '@fortawesome/free-solid-svg-icons';
	import { onMount } from 'svelte';
	import Fa from 'svelte-fa/src/fa.svelte';

	let navbarItemsWrapper: HTMLUListElement;
	let showDrawer = false;

	onMount(() => {
		navbarItemsWrapper.querySelectorAll('a').forEach((element) => {
			element.addEventListener('click', () => {
				showDrawer = false;
			});
		});
	});
</script>

<div class="drawer">
	<input id="navbar-drawer" type="checkbox" class="drawer-toggle" bind:checked={showDrawer} />
	<div class="drawer-content flex flex-col">
		<div class="flex-none lg:hidden">
			<label for="navbar-drawer" class="btn btn-square btn-ghost">
				<Fa icon={faBarsStaggered} />
			</label>
		</div>
		<div class="flex-none hidden lg:inline-flex">
			<ul class="menu menu-horizontal">
				<slot name="drawer-items" />
			</ul>
		</div>
	</div>
	<div class="drawer-side z-10">
		<label for="navbar-drawer" class="drawer-overlay" />
		<ul class="menu p-4 w-80 h-full bg-base-200" bind:this={navbarItemsWrapper}>
			<slot name="drawer-items" />
		</ul>
	</div>
</div>
