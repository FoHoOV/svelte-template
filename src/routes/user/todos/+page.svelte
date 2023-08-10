<script lang="ts">
	import todos from '$lib/stores/todos';
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import { validator } from '@felte/validator-zod';
	import type { z } from 'zod';
	import { createForm } from 'felte';
	import { schema } from './validator';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import { faTrash, faTrashCan } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa/src/fa.svelte';

	const { form, errors, data, isSubmitting, reset } = createForm<z.infer<typeof schema>>({
		extend: validator({ schema }),
		onSuccess: () => {
			todos.addTodo({
				title: $data.title,
				description: $data.description
			});
		}
	});
</script>

{#if $todos.length > 0}
	{#each $todos as todo (todo.id)}
		<div class="card bg-base-100 hover:bg-base-200 shadow-xl mt-4">
			<div class="card-body">
				<div class="card-title flex justify-between w-full">
					<h1>
						{todo.title}
					</h1>
					<Fa icon={faTrashCan} />
				</div>
				<p>{todo.description}</p>
			</div>
		</div>
	{/each}
{:else}
	<h1>no todos yet!</h1>
{/if}

<div class="divider" />

<form use:form class="flex items-start flex-row">
	<div class="card w-96 bg-neutral text-neutral-content">
		<div class="card-body items-center text-center">
			<FormInput name="title" className="w-full" hideLabel={true} errors={$errors.description} />
			<FormInput name="description" className="w-full" hideLabel={true} errors={$errors.title} />
			<div class="card-actions justify-end w-full">
				<LoadingButton text="add" className="flex-auto" loading={$isSubmitting} />
				<LoadingButton
					text="reset"
					className="btn-warning"
					on:click={(e) => {
						e.preventDefault();
						reset();
					}}
				/>
			</div>
		</div>
	</div>
</form>
