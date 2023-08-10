<script lang="ts">
	import { createForm } from 'felte';
	import FormError from '../../../lib/components/forms/FormError.svelte';
	import { goto } from '$app/navigation';
	import user from '../../../lib/stores/user';

	export let error: string | null = null;

	const { form } = createForm({
		onSuccess: () => {
			goto("/");
            user.logout();
		},
		onError: (response) => {
			error = <string>response;
		}
	});
</script>

<form use:form method="post">
	<div class="flex flex-col justify-center items-center">
		<h2>Are sure you are gonna miss out on this?</h2>
		<button class="btn btn-warning mt-2">Yes, I'm a piece of shit</button>
		<FormError {error} />
	</div>
</form>
