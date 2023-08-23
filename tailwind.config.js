import path from 'path'
import skeleton from "@skeletonlabs/skeleton/tailwind/skeleton"
import forms from "@tailwindcss/forms";

module.exports = {
	darkMode: 'class',
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		path.join(require.resolve(
			'@skeletonlabs/skeleton'),
			'../**/*.{html,js,svelte,ts}'
		)
	],
	theme: {
		extend: {},
	},
	plugins: [
		forms(),
		...skeleton()
	]
}