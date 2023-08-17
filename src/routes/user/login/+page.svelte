<script lang="ts">
	import { createForm, FelteSubmitError } from 'felte';
	import { schema } from './validator';
	import { validator } from '@felte/validator-zod';
	import type { z } from 'zod';
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import { goto } from '$app/navigation';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import FormError from '$lib/components/forms/FormError.svelte';
	import { enhance } from '$app/forms';

	let apiErrorTitle: string | null = null;

	const { form, data, errors, isSubmitting } = createForm<z.infer<typeof schema>>({
		extend: validator({ schema }),
		onSuccess: () => {
			goto('/user/todos');
		},
		onError: (error) => {
			console.log(error);
			debugger;
		}
	});
</script>

<form
	method="post"
	use:enhance
	use:form
	class="flex items-start justify-center card bg-neutral w-full flex-row"
>
	<div class="card-body items-center text-center md:flex-grow-0 md:flex-shrink-0 md:w-1/2">
		<FormError error={apiErrorTitle} />
		<FormInput name="username" className="w-full" errors={$errors.username} />
		<FormInput name="password" className="w-full" type="password" errors={$errors.password} />
		<div class="card-actions justify-start w-full">
			<LoadingButton
				className="btn-primary mt-4 flex-grow"
				text="login"
				loading={$isSubmitting}
				type="submit"
			/>
		</div>

		<span class="divider divider-vertical" />

		<a class="flex flex-col items-start self-start" href="/user/signup">
			<h5>Don't have an account yet?</h5>
			<span>create one here!</span>
		</a>
	</div>
</form>
