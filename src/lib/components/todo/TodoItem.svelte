<script lang="ts">
	import { faTrashCan } from '@fortawesome/free-solid-svg-icons';
	import todos from '$lib/stores/todos';
	import type { Todo } from '$lib/client/models/Todo';
	import { ApiError, TodoService } from '$lib/client';
	import Error from '$components/Error.svelte';
	import Fa from 'svelte-fa/src/fa.svelte';

	export let todo: Todo;
	let isBeingDeleted: boolean = false;
	let apiErrorTitle: string | null;
	async function handleRemove() {
		isBeingDeleted = true;
		try {
			await TodoService.makeCompleted(todo);
			todos.removeTodo(todo);
			isBeingDeleted = false;
		} catch (e) {
			const apiError = <ApiError>e;
			apiErrorTitle = apiError.message;
			isBeingDeleted = false;
		}
	}
</script>

<div class="card-body">
	<Error message={apiErrorTitle} />
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
