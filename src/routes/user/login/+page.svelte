<script lang="ts">
	import { createForm, type FelteErrorEvent, type FelteSuccessEvent } from 'felte';
	import type { PageData } from './$types';
	import { schema } from './validator';
	import { validator } from '@felte/validator-zod';
	import type { z } from 'zod';
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import user from '$lib/stores/user';
	import { goto } from '$app/navigation';
	import LoadingButton from '../../../lib/components/buttons/LoadingButton.svelte';

	const { form, errors, data, isSubmitting } = createForm<z.infer<typeof schema>>({
		extend: validator({ schema }),
		onSuccess: () => {
			user.login($data.username);
			goto('/user/todos');
		}
	});
</script>

<form method="post" use:form>
	<div class="form-control w-full max-w-xs">
		<FormInput name="username" errors={$errors.username} />
	</div>
	<LoadingButton className="btn-primary mt-4" text="login" loading={$isSubmitting} />
</form>
