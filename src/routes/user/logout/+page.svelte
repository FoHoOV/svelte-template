<script lang="ts">
	import { enhance } from '$app/forms';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import type { ActionData } from './$types';

	export let form: ActionData;

	let isSubmitting = false;
	const handleSubmit = () => {
		isSubmitting = true;
	};
	const handleError = (error: Event) => {
		isSubmitting = false;
		console.log(error);
		console.log(form);
		debugger;
	};
</script>

<div class="flex flex-col justify-center items-center">
	<h2>Are sure you are gonna miss out on this?</h2>
	<form method="post" use:enhance on:submit={handleSubmit} on:error={handleError}>
		<LoadingButton
			className="btn-warning mt-2"
			text="Yes, I'm a piece of shit"
			loading={isSubmitting}
			type="submit"
		/>
	</form>
</div>
