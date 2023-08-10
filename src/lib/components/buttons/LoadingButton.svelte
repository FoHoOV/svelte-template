<script lang="ts">
	export let text: string;
	export let loading: boolean = false;
	export let className: string = '';
</script>

<button class="btn {className}" disabled={loading}>
	{#if loading}
		<span class="loading loading-dots loading-sm" />
	{:else}
		{text}
	{/if}
</button>
