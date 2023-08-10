<script lang="ts">
	import { faTrashCan } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa/src/fa.svelte';
	import todos from '$lib/stores/todos';
	import type { Todo } from '$lib/types/user';

	export let todo: Todo;

	function handleRemove() {
		todos.removeTodo(todo);
	}
</script>

<div class="card-body">
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
