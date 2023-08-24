<script lang="ts">
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import TodoList from '$lib/components/todo/TodoList.svelte';
	import FormError from '$lib/components/forms/FormError.svelte';
	import { superEnhance } from '$lib/enhance/form';
	import type { ActionData } from './$types';
	import { TodoService, type Todo } from '$lib/client';
	import todos from '$lib/stores/todos';
	import { schema } from './validator';
	import { callServiceInClient } from '$lib/custom-client/client.client';

	export let form: ActionData;
	export let formElement: HTMLFormElement;
	$: createTodoFormErrors = form;
	let isCreateTodosSubmitting = false;

	async function fetchTodos() {
		const fetchedTodos = await callServiceInClient({
			serviceCall: async () => {
				return await TodoService.getForUser();
			}
		});
		todos.setTodos(fetchedTodos);
	}
</script>

<svelte:head>
	<title>todos</title>
</svelte:head>
<pre>
	{JSON.stringify(form)}
</pre>
<form
	use:superEnhance={{ validator: { schema }, form: form }}
	on:submitclienterror={(e) => {
		createTodoFormErrors = e.detail;
	}}
	on:submitstarted={() => {
		isCreateTodosSubmitting = true;
	}}
	on:submitstarted={() => {
		isCreateTodosSubmitting = false;
	}}
	on:submitsucceeded={(e) => {
		e.detail.result.todo && todos.addTodo(e.detail.result.todo);
	}}
	bind:this={formElement}
	method="post"
	class="flex items-start justify-center card bg-base-300 w-full flex-row"
>
	<div class="card-body items-center text-center md:flex-grow-0 md:flex-shrink-0 md:w-1/2">
		<FormError error={createTodoFormErrors?.message} />
		<FormInput className="hidden" type="checkbox" name="is_done" value={false} errors={''} />
		<FormInput
			name="title"
			className="w-full"
			hideLabel={true}
			errors={createTodoFormErrors?.title}
		/>
		<FormInput
			name="description"
			className="w-full"
			hideLabel={true}
			errors={createTodoFormErrors?.description}
		/>
		<div class="card-actions justify-end w-full">
			<LoadingButton
				text="add"
				className="flex-auto"
				type="submit"
				loading={isCreateTodosSubmitting}
			/>
			<LoadingButton
				text="reset"
				className="btn-warning"
				type="button"
				on:click={() => formElement.reset()}
			/>
		</div>
	</div>
</form>

<div class="divider" />

{#await fetchTodos()}
	<span class="loading loading-ring m-auto block" />
{:then}
	<TodoList />
{:catch error}
	<FormError error={error.message} />
{/await}
