<script lang="ts">
	import { enhance } from '$app/forms';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import FormError from '../../../lib/components/forms/FormError.svelte';
	import type { ActionData, SubmitFunction } from './$types';

	export let form: ActionData;

	let errorTitle: string | undefined;

	let isSubmitting = false;
	const handleSubmit = () => {
		isSubmitting = true;
	};
	const handleError: SubmitFunction = () => {
		isSubmitting = false;
		return async ({ result, update }) => {
			if (result.type == 'error') {
				isSubmitting = false;
				errorTitle = result.error.message;
				return;
			}
			await update();
		};
	};
</script>

<div class="flex flex-col justify-center items-center">
	<FormError error={errorTitle} />
	<h2>Are sure you are gonna miss out on this?</h2>
	<form method="post" use:enhance={handleError} on:submit={handleSubmit}>
		<LoadingButton
			className="btn-warning mt-2"
			text="Yes, I'm a piece of shit"
			loading={isSubmitting}
			type="submit"
		/>
	</form>
</div>
