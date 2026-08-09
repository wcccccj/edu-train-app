<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		/** 弹窗标题 */
		title: string;
		/** 关闭回调（点击遮罩或右上角关闭按钮触发） */
		onClose: () => void;
		/** 弹窗宽度档位 */
		maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
		/** 是否展示（默认 true，配合外部条件关闭） */
		open?: boolean;
		/** 顶部信息区（bg-slate-50，不随内容滚动），可选 */
		header?: Snippet;
		/** 可滚动内容区 */
		children: Snippet;
	}

	let { title, onClose, maxWidth = 'lg', open = true, header, children }: Props = $props();

	type ModalWidth = NonNullable<Props['maxWidth']>;

	const WIDTH_MAP: Record<ModalWidth, string> = {
		sm: 'max-w-sm',
		md: 'max-w-md',
		lg: 'max-w-lg',
		xl: 'max-w-xl',
		'2xl': 'max-w-2xl',
		'3xl': 'max-w-3xl'
	};
</script>

{#if open}
	<div class="fixed inset-0 z-40 flex items-center justify-center p-4">
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onclick={onClose}></div>

		<div
			class="relative flex max-h-[90vh] w-full flex-col overflow-hidden border border-slate-200 bg-white shadow-xl {WIDTH_MAP[
				maxWidth
			]}"
		>
			<div class="flex shrink-0 items-center justify-between border-b border-slate-100 p-5">
				<h2 class="text-lg font-semibold text-slate-900">{title}</h2>
				<button
					onclick={onClose}
					class="text-slate-400 transition-colors hover:text-slate-600"
					aria-label="关闭"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						></path></svg
					>
				</button>
			</div>

			{#if header}
				<div class="shrink-0 border-b border-slate-100 bg-slate-50 p-5">
					{@render header()}
				</div>
			{/if}

			<div class="overflow-y-auto p-6">
				{@render children()}
			</div>
		</div>
	</div>
{/if}
