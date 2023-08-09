import daisyui from 'daisyui';
import { themes } from 'daisyui/src/colors/themes';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	daisyui: {
		themes: {
			dark: {
				...themes['[data-theme=dark]'],
				primary: '#641ae6',
				secondary: '#d926a9',
				accent: '#1fb2a6',
				neutral: '#2a323c',
				'base-100': '#1d232a',
				info: '#3abff8',
				success: '#36d399',
				warning: '#fbbd23',
				error: '#f87272'
			},
			light: {
				...themes['[data-theme=light]'],
				primary: '#f4f11a',
				secondary: '#6502dd',
				accent: '#c62b30',
				neutral: '#1a1929',
				'base-100': '#e4e5e7',
				info: '#4499e9',
				success: '#13aa4a',
				warning: '#fad12e',
				error: '#e46770'
			}
		}
	},
	theme: {
		extend: {}
	},
	plugins: [typography, daisyui]
};
