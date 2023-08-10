<script lang="ts">
	import FormError from './FormError.svelte';

	export let className: string = '';
	export let name: string;
	export let errors: string[] | null;
	export let hideLabel: boolean = false;
</script>

<div class="flex flex-col md:flex-row {className}">
	<label class="label" class:hidden={hideLabel} for={name}>
		<span class="label-text">{name}</span>
	</label>
	<input
		type="text"
		id={name}
		{name}
		placeholder={name}
		class="input input-bordered w-full max-w-xs"
	/>
	<FormError error={errors?.at(0)} className="mt-2" />
</div>
