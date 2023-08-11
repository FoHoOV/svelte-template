<script lang="ts">
	import { createForm, FelteSubmitError, type FelteErrorEvent, type FelteSuccessEvent } from 'felte';
	import type { PageData } from './$types';
	import { schema } from './validator';
	import { validator } from '@felte/validator-zod';
	import type { z } from 'zod';
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import user from '$lib/stores/user';
	import { goto } from '$app/navigation';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';

	const { form, errors, data, isSubmitting } = createForm<z.infer<typeof schema>>({
		extend: validator({ schema }),
		onSuccess: () => {
			user.login($data.username);
			goto('/user/todos');
		},
		onError: async (error) => {
			if (!(error instanceof FelteSubmitError)) {
				return;
			}
			const json = await error.response.json();
			const serverError: App.Error = json.error;
			return serverError.data;
		}
	});
</script>

<form
	method="post"
	use:form
	class="flex items-start justify-center card bg-neutral w-full flex-row"
>
	<div class="card-body items-center text-center md:flex-grow-0 md:flex-shrink-0 md:w-1/2">
		<FormInput name="username" className="w-full" errors={$errors.username} />
		<FormInput name="password" className="w-full" type="password" errors={$errors.password} />
		<div class="card-actions justify-start w-full">
			<LoadingButton
				className="btn-primary mt-4"
				text="login"
				loading={$isSubmitting}
				type="submit"
			/>
			<LoadingButton
				className="btn-primary mt-4"
				text="signup"
				loading={$isSubmitting}
				on:click={() => goto('/user/signup')}
			/>
		</div>
	</div>
</form>
