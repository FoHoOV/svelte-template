<script lang="ts">
	import { faTrashCan } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa/src/fa.svelte';
	import todos from '$lib/stores/todos';
	import type { Todo } from '$lib/types/user';

	export let todo: Todo;
	let isBeingDeleted: boolean = false;

	function handleRemove() {
		isBeingDeleted = true;
		todos.removeTodo(todo);
	}
</script>

<div class="card-body">
	{#if isBeingDeleted}
		<div
			class="absolute flex align-center justify-center top-0.5 left-0.5 w-full h-full z-10 bg-base-300 rounded-lg"
		>
			<span class="loading loading-spinner loading-md dark:text-black" />
		</div>
	{/if}
	<div class="card-title flex justify-between w-full">
		<h1>
			{todo.title}
		</h1>
		<button on:click={handleRemove}>
			<Fa icon={faTrashCan} class="text-red-400" />
		</button>
	</div>
	<p>{todo.description}</p>
</div>
