<script lang="ts">
	import type { ActionData } from './$types';
	import { schema } from './validator';
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import FormError from '$lib/components/forms/FormError.svelte';
	import { customEnhance } from '$lib/form-validator';

	export let form: ActionData;
	let isFormSubmitting: boolean = false;
	$: validationErrors = form;
</script>

<form
	method="post"
	use:customEnhance={{ validator: schema.innerType() }}
	on:formerror={(event) => {
		validationErrors = event.detail;
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
		<FormError error={form?.message} /> <!-- TODO: fix the typings -->
		<FormInput name="username" className="w-full" errors={validationErrors?.username} />
		<FormInput
			name="password"
			className="w-full"
			type="password"
			errors={validationErrors?.password}
		/>
		<FormInput
			name="confirmPassword"
			label="confirm password"
			className="w-full"
			type="password"
			errors={validationErrors?.confirmPassword}
		/>
		<div class="card-actions justify-start w-full">
			<LoadingButton
				className="btn-primary mt-4 flex-grow"
				text="signup"
				loading={isFormSubmitting}
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
