<script lang="ts">
	import { messageStore, type MessageType } from './message.store.svelte';

	const ICON_PATHS: Record<MessageType, string> = {
		success: 'M5 13l4 4L19 7',
		error: 'M6 18L18 6M6 6l12 12',
		warning: 'M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
		info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
	};

	const TYPE_CLASSES: Record<MessageType, string> = {
		success:
			'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700 shadow-lg',
		error:
			'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 shadow-lg',
		warning:
			'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-700 shadow-lg',
		info: 'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-blue-700 shadow-lg'
	};
</script>

{#if messageStore.messages.length > 0}
	<div
		class="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4"
		role="region"
		aria-label="消息通知"
		aria-live="polite"
	>
		{#each messageStore.messages as msg (msg.id)}
			<div
				role={msg.type === 'error' ? 'alert' : 'status'}
				class={TYPE_CLASSES[msg.type]}
			>
				<span class="mt-0.5 shrink-0">
					<svg
						class="h-5 w-5"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						viewBox="0 0 24 24"
						aria-hidden="true"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							d={ICON_PATHS[msg.type]}
						></path></svg
					>
				</span>
				<div class="min-w-0 flex-1">
					<p class="text-sm font-semibold">{msg.title}</p>
					<p class="mt-0.5 break-words text-sm leading-snug">{msg.content}</p>
				</div>
				<button
					type="button"
					class="shrink-0 rounded p-1 text-current opacity-60 transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-current"
					aria-label="关闭消息"
					onclick={() => messageStore.close(msg.id)}
				>
					<svg
						class="h-4 w-4"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						viewBox="0 0 24 24"
						aria-hidden="true"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M6 18L18 6M6 6l12 12"
						></path></svg
					>
				</button>
			</div>
		{/each}
	</div>
{/if}