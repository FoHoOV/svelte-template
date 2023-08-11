<script lang="ts">
	import { createForm } from 'felte';
	import FormError from '$lib/components/forms/FormError.svelte';
	import { goto } from '$app/navigation';
	import user from '$lib/stores/user';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';

	export let error: string | null = null;

	const { form, isSubmitting } = createForm({
		onSuccess: () => {
			goto('/');
			user.logout();
		}
	});
</script>

<form use:form>
	<div class="flex flex-col justify-center items-center">
		<h2>Are sure you are gonna miss out on this?</h2>
		<LoadingButton
			className="btn-warning mt-2"
			text="Yes, I'm a piece of shit"
			loading={$isSubmitting}
			type="submit"
		/>
		<FormError {error} />
	</div>
</form>
