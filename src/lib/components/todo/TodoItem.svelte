<script lang="ts">
	import {
		faCheckCircle,
		faCircle
	} from '@fortawesome/free-solid-svg-icons';
	import todos from '$lib/stores/todos';
	import type { Todo } from '$lib/client/models/Todo';
	import { TodoService } from '$lib/client';
	import Error from '$components/Error.svelte';
	import Fa from 'svelte-fa/src/fa.svelte';
	import { callServiceInClient } from '$lib/custom-client/client.client';

	export let todo: Todo;
	let isChangingDoneStatus: boolean = false;
	let apiErrorTitle: string | null;

	async function handleChangeDoneStatus() {
		isChangingDoneStatus = true;
		await callServiceInClient({
			serviceCall: async () => {
				await TodoService.makeCompleted(todo);
				todos.updateTodo(todo, !todo.is_done);
				isChangingDoneStatus = false;
			},
			errorCallback: async (e) => {
				isChangingDoneStatus = true;
				apiErrorTitle = e.message;
			}
		});
	}
</script>

<div class="card-body">
	<Error message={apiErrorTitle} />
	{#if isChangingDoneStatus}
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
		{#if todo.is_done}
			<button on:click={handleChangeDoneStatus}>
				<Fa icon={faCheckCircle} class="text-red-400" />
			</button>
		{:else}
			<button on:click={handleChangeDoneStatus}>
				<Fa icon={faCircle} class="text-green-400" />
			</button>
		{/if}
	</div>
	<p>{todo.description}</p>
</div>
