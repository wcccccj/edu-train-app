<script lang="ts">
	/**
	 * 通用可复用分页组件
	 *
	 * 通过「数据总量 + 每页条数」计算总页数，支持页码展示数量自定义、
	 * 上一页/下一页导航、直接跳转到指定页码，并提供页码变更事件回调。
	 */

	export interface PaginationProps {
		/** 数据总量 */
		totalItems: number;
		/** 每页显示条数 */
		pageSize: number;
		/** 当前页码（可双向绑定） */
		currentPage?: number;
		/** 最多展示的页码按钮数量（含首尾页），默认 7 */
		maxVisiblePages?: number;
		/** 页码变更回调 */
		onPageChange?: (page: number) => void;
		/** 是否展示跳转输入框，默认 true */
		showJump?: boolean;
		/** 是否展示「共 N 条」汇总信息，默认 false */
		showTotal?: boolean;
	}

	let {
		totalItems,
		pageSize,
		currentPage = $bindable(1),
		maxVisiblePages = 7,
		onPageChange,
		showJump = true,
		showTotal = false
	}: PaginationProps = $props();

	/** 总页数（至少 1 页） */
	let totalPages = $derived(Math.max(1, Math.ceil(totalItems / Math.max(1, pageSize))));

	/** 将页码收敛到合法区间 [1, totalPages] */
	function clampPage(page: number): number {
		return Math.min(totalPages, Math.max(1, Math.floor(page)));
	}

	/** 合法化后的当前页码，避免越界 */
	let safeCurrentPage = $derived(clampPage(currentPage));

	/** 跳转输入框的值 */
	let jumpValue = $state('');

	/**
	 * 生成页码序列。
	 * - 总页数不超过 maxVisiblePages 时全部展示；
	 * - 否则固定首尾页，中间以「窗口 + 省略号」折叠，保证展示数量不超过 maxVisiblePages。
	 */
	let pages = $derived.by<Array<number | 'ellipsis'>>(() => {
		const total = totalPages;
		const current = safeCurrentPage;

		if (total <= maxVisiblePages) {
			return Array.from({ length: total }, (_, i) => i + 1);
		}

		const windowSize = Math.max(1, maxVisiblePages - 2);
		let start = Math.max(2, current - 1);
		let end = start + windowSize - 1;

		if (end > total - 1) {
			end = total - 1;
			start = Math.max(2, end - windowSize + 1);
		}

		const result: Array<number | 'ellipsis'> = [1];
		if (start > 2) result.push('ellipsis');
		for (let i = start; i <= end; i++) result.push(i);
		if (end < total - 1) result.push('ellipsis');
		result.push(total);
		return result;
	});

	function isCurrent(p: number | 'ellipsis'): boolean {
		return p !== 'ellipsis' && p === safeCurrentPage;
	}

	/** 切换页码：收敛后更新状态并触发回调 */
	function goTo(page: number) {
		const next = clampPage(page);
		if (next === safeCurrentPage) return;
		currentPage = next;
		onPageChange?.(next);
	}

	/** 直接跳转：解析输入框中的页码 */
	function handleJump() {
		const value = Number.parseInt(jumpValue, 10);
		if (Number.isNaN(value)) return;
		goTo(value);
		jumpValue = '';
	}
</script>

{#if totalPages > 1}
	<nav class="flex flex-wrap items-center justify-center gap-1.5" aria-label="分页导航">
		{#if showTotal}
			<span class="mr-2 text-sm text-slate-400">共 {totalItems} 条</span>
		{/if}

		<button
			type="button"
			onclick={() => goTo(safeCurrentPage - 1)}
			disabled={safeCurrentPage <= 1}
			class="inline-flex h-9 min-w-9 items-center justify-center border border-slate-200 bg-white px-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-100 disabled:text-slate-300"
			aria-label="上一页"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
				><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"
				></path></svg
			>
		</button>

		{#each pages as p, i (p === 'ellipsis' ? 'ellipsis_' + i : 'page_' + p)}
			{#if p === 'ellipsis'}
				<span class="px-1 text-sm text-slate-400">…</span>
			{:else}
				<button
					type="button"
					onclick={() => goTo(p)}
					aria-current={isCurrent(p) ? 'page' : undefined}
					class="inline-flex h-9 min-w-9 items-center justify-center border px-3 text-sm transition-colors"
					class:border-blue-600={isCurrent(p)}
					class:bg-blue-600={isCurrent(p)}
					class:text-white={isCurrent(p)}
					class:border-slate-200={!isCurrent(p)}
					class:bg-white={!isCurrent(p)}
					class:text-slate-600={!isCurrent(p)}
					class:hover:bg-slate-50={!isCurrent(p)}
				>
					{p}
				</button>
			{/if}
		{/each}

		<button
			type="button"
			onclick={() => goTo(safeCurrentPage + 1)}
			disabled={safeCurrentPage >= totalPages}
			class="inline-flex h-9 min-w-9 items-center justify-center border border-slate-200 bg-white px-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-100 disabled:text-slate-300"
			aria-label="下一页"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
				><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"
				></path></svg
			>
		</button>

		{#if showJump}
			<div class="ml-2 flex items-center gap-1.5">
				<span class="text-sm text-slate-500">跳至</span>
				<input
					type="number"
					min="1"
					max={totalPages}
					bind:value={jumpValue}
					onkeydown={(e) => {
						if (e.key === 'Enter') handleJump();
					}}
					class="h-9 w-16 border border-slate-200 bg-white px-2 text-center text-sm text-slate-700 outline-none transition-colors focus:border-blue-600"
					aria-label="跳转页码输入"
				/>
				<button
					type="button"
					onclick={handleJump}
					class="inline-flex h-9 items-center justify-center border border-slate-200 bg-white px-3 text-sm text-slate-600 transition-colors hover:bg-slate-50"
				>
					确定
				</button>
			</div>
		{/if}
	</nav>
{/if}