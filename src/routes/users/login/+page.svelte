<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<form method="post">
	<div class="form-control w-full max-w-xs">
		<label class="label" for="username">
			<span class="label-text">Username</span>
		</label>
		<input
			type="text"
			id="username"
			placeholder="Type here"
			class="input input-bordered w-full max-w-xs"
		/>
	</div>
	<button class="btn btn-primary mt-4" type="submit">Login</button>
</form>
