<script lang="ts">
	import { toastStore } from '../toast.svelte';
	import { fade, fly } from 'svelte/transition';
</script>

<div
	class="pointer-events-none fixed top-4 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2"
>
	{#each toastStore.toasts as toast (toast.id)}
		<div
			in:fly={{ y: -20, duration: 300 }}
			out:fade={{ duration: 200 }}
			class="pointer-events-auto flex items-center gap-2 rounded border px-4 py-2 text-sm font-medium shadow-sm"
			class:bg-blue-50={toast.type === 'info'}
			class:text-blue-700={toast.type === 'info'}
			class:border-blue-200={toast.type === 'info'}
			class:bg-green-50={toast.type === 'success'}
			class:text-green-700={toast.type === 'success'}
			class:border-green-200={toast.type === 'success'}
			class:bg-red-50={toast.type === 'error'}
			class:text-red-700={toast.type === 'error'}
			class:border-red-200={toast.type === 'error'}
		>
			{#if toast.type === 'success'}
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
					><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"
					></path></svg
				>
			{:else if toast.type === 'error'}
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					></path></svg
				>
			{:else}
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					></path></svg
				>
			{/if}
			{toast.message}
		</div>
	{/each}
</div>
