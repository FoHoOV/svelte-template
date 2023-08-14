<script lang="ts">
	import FormError from './FormError.svelte';

	export let className: string = '';
	export let name: string;
	export let label: string = name;
	export let errors: string[] | null;
	export let hideLabel: boolean = false;
	export let type: 'text' | 'password' = 'text';
</script>

<div class="flex flex-col {className}">
	<label class="label" class:hidden={hideLabel} for={name}>
		<span class="label-text">{label}</span>
	</label>
	<input {type} id={name} {name} placeholder={label} class="input input-bordered w-full" />
	<FormError error={errors?.at(0)} className="mt-2" />
</div>
