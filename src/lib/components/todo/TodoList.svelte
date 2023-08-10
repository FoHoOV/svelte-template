<script lang="ts">
	import todos from '$lib/stores/todos';
	import TodoItem from './TodoItem.svelte';
</script>

{#if $todos.length > 0}
	{#each $todos as todo (todo.id)}
		<div class="card bg-base-200 hover:bg-base-100 shadow-xl mt-4">
			<TodoItem {todo} />
		</div>
	{/each}
{:else}
	<h1>no todos yet!</h1>
{/if}
