<script lang="ts">
	import { createForm } from 'felte';
	import type { PageData } from './$types';
	import { schema } from './validator';
	import { validator } from '@felte/validator-zod';
	import type { z } from 'zod';
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import user from '$lib/stores/user';
	import { goto } from '$app/navigation';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import FormError from '$lib/components/forms/FormError.svelte';
	import { UserService, type ApiError, type Token } from '$lib/client';

	let apiErrorTitle: null | string = '';

	const { form, errors, data, isSubmitting } = createForm<z.infer<typeof schema>>({
		extend: validator({ schema }),
		onSubmit: async (values) => {
			return await UserService.signup(values);
		},
		onSuccess: (response) => {
			goto('/user/login');
		},
		onError: async (error) => {
			const apiError = <ApiError>error;
			apiErrorTitle = apiError.body.detail?.username || apiError.body.detail;
		}
	});
</script>

<form
	method="post"
	use:form
	class="flex items-start justify-center card bg-neutral w-full flex-row"
>
	<div class="card-body items-center text-center md:flex-grow-0 md:flex-shrink-0 md:w-1/2">
		<FormError error={apiErrorTitle} />
		<FormInput name="username" className="w-full" errors={$errors.username} />
		<FormInput name="password" className="w-full" type="password" errors={$errors.password} />
		<div class="card-actions justify-start w-full">
			<LoadingButton
				className="btn-primary mt-4"
				text="signup"
				loading={$isSubmitting}
				type="submit"
			/>
		</div>
		
		<span class="divider divider-vertical" />

		<a class="flex flex-col items-start self-start" href="/user/login">
			<h5>Already have an account?</h5>
			<span>login here!</span>
		</a>
	</div>
</form>
