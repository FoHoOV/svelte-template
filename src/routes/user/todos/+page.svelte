<script lang="ts">
	import todos from '$lib/stores/todos';
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import { validator } from '@felte/validator-zod';
	import type { z } from 'zod';
	import { createForm, FelteSubmitError } from 'felte';
	import { schema } from './validator';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import TodoList from '$lib/components/todo/TodoList.svelte';

	const { form, errors, data, isSubmitting, reset } = createForm<z.infer<typeof schema>>({
		extend: validator({ schema }),
		onError: async (error) => {
			if (!(error instanceof FelteSubmitError)) {
				return;
			}
			const json = await error.response.json();
			const serverError: App.Error = json.error;
			return serverError.data
		},
		onSuccess: () => {
			todos.addTodo({
				title: $data.title,
				description: $data.description
			});
		}
	});

	function handleReset(e: MouseEvent) {
		e.preventDefault();
		reset();
	}
</script>

<TodoList />

<div class="divider" />

<form
	use:form
	method="post"
	class="flex items-start justify-center card bg-neutral w-full flex-row"
>
	<div class="card-body items-center text-center md:flex-grow-0 md:flex-shrink-0 md:w-1/2">
		<FormInput name="title" className="w-full" hideLabel={true} errors={$errors.title} />
		<FormInput
			name="description"
			className="w-full"
			hideLabel={true}
			errors={$errors.description}
		/>
		<div class="card-actions justify-end w-full">
			<LoadingButton text="add" className="flex-auto" loading={$isSubmitting} />
			<LoadingButton text="reset" className="btn-warning" on:click={handleReset} />
		</div>
	</div>
</form>
