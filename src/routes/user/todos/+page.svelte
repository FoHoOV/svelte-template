<script lang="ts">
	import todos from '$lib/stores/todos';
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import { validator } from '@felte/validator-zod';
	import type { z } from 'zod';
	import { createForm } from 'felte';
	import { schema } from './validator';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import TodoList from '$lib/components/todo/TodoList.svelte';
	import { TodoService, type Todo, ApiError } from '$lib/client';
	import { onMount } from 'svelte';
	import FormError from '$lib/components/forms/FormError.svelte';

	let isFetchingTodosFromServer = true;

	let apiErrorTitle: string | null = null;

	onMount(() => {
		fetchTodos();
	});

	const { form, errors, isSubmitting, reset } = createForm<z.infer<typeof schema>>({
		extend: validator({ schema }),
		onSubmit: async (values) => {
			return await TodoService.createForUser({ ...values, is_done: false });
		},
		onSuccess: (response) => {
			const todoItem = <Todo>response;
			todos.addTodo(todoItem);
			reset();
		},
		onError: async (error) => {
			const apiError = <ApiError>error;
			apiErrorTitle = apiError.body.detail ?? apiError.message;
		}
	});

	async function fetchTodos() {
		todos.setTodos(await TodoService.getForUser());
		isFetchingTodosFromServer = false;
	}

	function handleReset(e: MouseEvent) {
		e.preventDefault();
		reset();
	}
</script>

<form
	use:form
	method="post"
	class="flex items-start justify-center card bg-neutral w-full flex-row"
>
	<div class="card-body items-center text-center md:flex-grow-0 md:flex-shrink-0 md:w-1/2">
		<FormError error={apiErrorTitle} />
		<FormInput name="title" className="w-full" hideLabel={true} errors={$errors.title} />
		<FormInput
			name="description"
			className="w-full"
			hideLabel={true}
			errors={$errors.description}
		/>
		<div class="card-actions justify-end w-full">
			<LoadingButton text="add" className="flex-auto" loading={$isSubmitting} type="submit" />
			<LoadingButton text="reset" className="btn-warning" on:click={handleReset} />
		</div>
	</div>
</form>

<div class="divider" />

{#if isFetchingTodosFromServer}
	<span class="loading loading-ring m-auto block" />
{:else}
	<TodoList />
{/if}
