import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
	plugins: [
		svelte({
			compilerOptions: {
				runes: true,
				generate: 'client'
			}
		})
	],
	resolve: {
		conditions: ['browser', 'development'],
		alias: {
			$lib: new URL('./src/lib', import.meta.url).pathname,
			$app: new URL('./node_modules/@sveltejs/kit/src/runtime/app', import.meta.url).pathname
		}
	},
	test: {
		expect: { requireAssertions: true },
		environment: 'happy-dom',
		environmentOptions: {
			'happy-dom': {
				url: 'http://localhost/'
			}
		},
		globals: true,
		setupFiles: ['./src/lib/components/setup-tests.ts'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html', 'lcov'],
			all: true,
			include: ['src/lib/components/CourseCard.svelte'],
			exclude: []
		},
		include: ['src/**/*.{test,spec}.{js,ts}'],
		exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
	}
});
