const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./app/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			fontFamily: {
				mono: ['Red Hat Mono', ...defaultTheme.fontFamily.mono],
			},
		},
	},
	plugins: [],
};
