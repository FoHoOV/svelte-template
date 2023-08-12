<script lang="ts">
	import Fa from 'svelte-fa/src/fa.svelte';
	import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
	export let error: string | undefined | null = null;
	export let className: string = '';
</script>

{#if error}
	<div class="alert alert-error rounded-md {className}">
		<Fa icon={faExclamationCircle} />
		<span>{error}</span>
	</div>
{/if}
