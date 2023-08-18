<script lang="ts">
	import { schema } from './validator';
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import { customEnhance } from '$lib/form-validator';
	import type { ActionData } from './$types';
	import { getContext } from 'svelte';

	export let form: ActionData;
	let isFormSubmitting: boolean = false;
	$: validationErrors = form;
</script>

<pre>
	{JSON.stringify(form)}
</pre>

<form
	method="post"
	use:customEnhance={{ validator: schema }}
	on:formerror={(errors) => {
		validationErrors = errors.detail;
	}}
	on:submitstarted={() => {
		isFormSubmitting = true;
	}}
	on:submitended={() => {
		isFormSubmitting = false;
	}}
	class="flex items-start justify-center card bg-neutral w-full flex-row"
>
	<div class="card-body items-center text-center md:flex-grow-0 md:flex-shrink-0 md:w-1/2">
		<FormInput name="username" className="w-full" errors={validationErrors?.username} />
		<FormInput
			name="password"
			className="w-full"
			type="password"
			errors={validationErrors?.password}
		/>
		<div class="card-actions justify-start w-full">
			<LoadingButton
				className="btn-primary mt-4 flex-grow"
				text="login"
				loading={isFormSubmitting}
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
