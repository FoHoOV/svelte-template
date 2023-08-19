<script lang="ts">
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import TodoList from '$lib/components/todo/TodoList.svelte';
	import FormError from '$lib/components/forms/FormError.svelte';
	import { customEnhance } from '$lib/form-validator';
	import type { ActionData } from './$types';
	import { onMount } from 'svelte';
	import { TodoService } from '$lib/client';
	import todos from '$lib/stores/todos';
	import { schema } from './validator';

	export let form: ActionData;
	export let formElement: HTMLFormElement;
	$: createTodoFormErrors = form;
	let isCreateTodosSubmitting = false;
	let isFetchingTodosFromServer = true;

	onMount(() => {
		fetchTodos();
	});

	async function fetchTodos() {
		todos.setTodos(await TodoService.getForUser());
		isFetchingTodosFromServer = false;
	}
</script>

<form
	use:customEnhance={{ validator: schema }}
	on:formclienterror={(event) => {
		createTodoFormErrors = event.detail;
	}}
	on:submitstarted={() => {
		isCreateTodosSubmitting = true;
	}}
	on:submitstarted={() => {
		isCreateTodosSubmitting = false;
	}}
	bind:this={formElement}
	method="post"
	class="flex items-start justify-center card bg-neutral w-full flex-row"
>
	<div class="card-body items-center text-center md:flex-grow-0 md:flex-shrink-0 md:w-1/2">
		<FormError error={createTodoFormErrors?.message} />
		<FormInput type="hidden" name="is_done" value={true} errors={''} />
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
			<LoadingButton text="add" className="flex-auto" loading={isCreateTodosSubmitting} />
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

{#if isFetchingTodosFromServer}
	<span class="loading loading-ring m-auto block" />
{:else}
	<TodoList />
{/if}
