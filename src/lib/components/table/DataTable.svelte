<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import type { Align, Column, ColumnWidth, PaginationConfig } from './table.types';
	import { buildEllipsis, truncateText, type EllipsisMeta } from './ellipsis';

	interface DataTableProps {
		/** 数据源 */
		data: T[];
		/** 列配置 */
		columns: Column<T>[];
		/** 行唯一标识：字段名或取值函数，用于 {#each} key 与性能优化 */
		rowKey?: keyof T | ((row: T) => string | number);
		/** 分页配置，提供后组件自动切片并渲染分页栏 */
		pagination?: PaginationConfig;
		/** 是否加载中 */
		loading?: boolean;
		/** 空数据提示文案，默认「暂无数据」 */
		emptyText?: string;
		/** 是否启用斑马纹 */
		striped?: boolean;
		/** 自定义单元格渲染插槽（全局兜底），参数为 (row, column) */
		cell?: Snippet<[T, Column<T>]>;
		/** 逐列自定义渲染插槽，以列 key 为键，参数为 (row)。优先级高于 cell 与声明式配置 */
		snippets?: Partial<Record<string, Snippet<[T]>>>;
		/** 自定义表头单元格渲染插槽，参数为 (column) */
		headerCell?: Snippet<[Column<T>]>;
		/** 自定义空状态插槽（无参数），用于完全定制空数据展示 */
		empty?: Snippet;
		/** 表尾扩展内容 */
		footer?: Snippet;
		/** 容器额外类名 */
		class?: string;
	}

	let {
		data,
		columns,
		rowKey,
		pagination,
		loading = false,
		emptyText = '暂无数据',
		striped = false,
		cell,
		snippets,
		headerCell,
		empty,
		footer,
		class: className = ''
	}: DataTableProps = $props();

	// ---------- 分页派生数据 ----------
	let totalRows = $derived(pagination?.total ?? data.length);
	let totalPages = $derived(
		pagination ? Math.max(1, Math.ceil(totalRows / pagination.pageSize)) : 1
	);

	let visibleRows = $derived.by(() => {
		if (!pagination) return data;
		const size = pagination.pageSize;
		const start = (pagination.currentPage - 1) * size;
		return data.slice(start, start + size);
	});

	let pageList = $derived.by(() => {
		const total = totalPages;
		const current = pagination?.currentPage ?? 1;
		if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
		const result: Array<number | 'ellipsis'> = [1];
		if (current > 3) result.push('ellipsis');
		for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
			result.push(i);
		}
		if (current < total - 2) result.push('ellipsis');
		result.push(total);
		return result;
	});

	// 预计算列元信息，避免逐行重复计算
	let columnMeta = $derived(
		columns.map((col) => ({
			col,
			alignClass: alignClass(col.align),
			widthStyle: widthStyle(col.width),
			ellipsis: col.ellipsis ? buildEllipsis(col.ellipsis) : null
		}))
	);

	// ---------- 工具函数 ----------
	function alignClass(align: Align | undefined): string {
		if (align === 'center') return 'text-center';
		if (align === 'right') return 'text-right';
		return 'text-left';
	}

	/** 根据列宽配置生成内联样式 */
	function widthStyle(width: ColumnWidth | undefined): string {
		if (width == null) return '';
		if (typeof width === 'number') return `width:${width}px;min-width:${width}px`;
		if (width === 'auto') return '';
		if (typeof width === 'string') return `width:${width}`; // 百分比
		const parts: string[] = [];
		if (width.min != null) parts.push(`min-width:${width.min}px`);
		if (width.max != null) parts.push(`max-width:${width.max}px`);
		return parts.join(';');
	}

	function getRowKey(row: T, index: number): string | number {
		if (!rowKey) return index;
		if (typeof rowKey === 'function') return rowKey(row);
		return String((row as Record<string, unknown>)[rowKey as string]);
	}

	/** 读取单元格原始值 */
	function cellValue(row: T, col: Column<T>): unknown {
		return (row as Record<string, unknown>)[col.key];
	}

	/**
	 * 声明式单元格解析：formatter → map → 原始值（空则 fallback）。
	 * 仅用于未提供 snippets / cell 插槽的列。
	 */
	function renderDefault(row: T, col: Column<T>, meta: EllipsisMeta | null): string {
		const value = cellValue(row, col);
		let text: string | number;
		if (col.formatter) {
			text = col.formatter(value, row);
		} else if (col.map && value != null) {
			const key = String(value);
			text = col.map[key] ?? key;
		} else {
			const raw = value == null ? '' : String(value);
			text = raw === '' ? (col.fallback ?? '') : raw;
		}
		const str = String(text);
		if (meta?.isMiddle) {
			return truncateText(str, meta.position, meta.symbol, meta.headChars, meta.tailChars);
		}
		return str;
	}

	function isCurrent(p: number | 'ellipsis'): boolean {
		return p !== 'ellipsis' && p === pagination?.currentPage;
	}

	function go(page: number): void {
		if (!pagination || page < 1 || page > totalPages) return;
		pagination.onPageChange(page);
	}
</script>

<div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm {className}">
	<div class="overflow-x-auto">
		<table class="w-full text-left text-sm">
			<thead class="border-b border-slate-200 bg-slate-50">
				<tr>
					{#each columnMeta as { col, alignClass, widthStyle } (col.key)}
						<th
							class="px-5 py-3.5 font-semibold text-slate-700 {alignClass} {col.headerClass ?? ''}"
							style={widthStyle}
						>
							{#if headerCell}
								{@render headerCell(col)}
							{:else}
								{col.title}
							{/if}
						</th>
					{/each}
				</tr>
			</thead>
			<tbody class="divide-y divide-slate-100">
				{#if loading}
					<tr>
						<td colspan={columns.length} class="px-5 py-12 text-center text-slate-400">
							加载中…
						</td>
					</tr>
				{:else if visibleRows.length === 0}
					<tr>
						<td colspan={columns.length}>
							{#if empty}
								{@render empty()}
							{:else}
								<div class="flex flex-col items-center justify-center gap-3 px-5 py-16 text-center">
									<!-- 空状态插图（Element Plus 风格） -->
									<svg
										class="h-16 w-16 text-slate-200"
										fill="none"
										stroke="currentColor"
										stroke-width="1.2"
										viewBox="0 0 64 64"
										aria-hidden="true"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M20 24h10M20 32h6M20 40h14M42 14h6v4h-6zM14 12h20l4 4v34a2 2 0 01-2 2H14a2 2 0 01-2-2V14a2 2 0 012-2z"
										/>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M40 22l8 8m0-8l-8 8"
										/>
									</svg>
									<p class="text-sm text-slate-400">{emptyText}</p>
								</div>
							{/if}
						</td>
					</tr>
				{:else}
					{#each visibleRows as row, i (getRowKey(row, i))}
						<tr
							class="transition-colors hover:bg-slate-50 {striped && i % 2 === 1
								? 'bg-slate-50/60'
								: ''}"
						>
							{#each columnMeta as { col, alignClass, widthStyle, ellipsis } (col.key)}
								<td
									class="px-5 py-4 text-slate-600 {alignClass} {col.cellClass ?? ''}"
									style={widthStyle}
								>
									{#if ellipsis}
										<div
											class={ellipsis.className}
											style={ellipsis.style}
											title={ellipsis.showTooltip && !snippets?.[col.key] && !cell
												? renderDefault(row, col, null)
												: undefined}
										>
											{#if snippets?.[col.key]}
												{@render snippets[col.key]!(row)}
											{:else if cell}
												{@render cell(row, col)}
											{:else}
												{renderDefault(row, col, ellipsis)}
											{/if}
										</div>
									{:else if snippets?.[col.key]}
										{@render snippets[col.key]!(row)}
									{:else if cell}
										{@render cell(row, col)}
									{:else}
										{renderDefault(row, col, null)}
									{/if}
								</td>
							{/each}
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>

	{#if pagination}
		<div class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-3.5">
			<p class="text-sm text-slate-500">共 {totalRows} 条</p>
			{#if totalPages > 1}
				<nav class="flex items-center gap-1.5" aria-label="表格分页">
					<button
						type="button"
						onclick={() => go(pagination.currentPage - 1)}
						disabled={pagination.currentPage <= 1}
						class="inline-flex h-9 min-w-9 items-center justify-center border border-slate-200 bg-white px-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-100 disabled:text-slate-300"
						aria-label="上一页"
					>
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
							><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"
							></path></svg
						>
					</button>
					{#each pageList as p (p === 'ellipsis' ? 'ellipsis_' + pagination.currentPage : 'page_' + p)}
						{#if p === 'ellipsis'}
							<span class="px-1 text-sm text-slate-400">…</span>
						{:else}
							<button
								type="button"
								onclick={() => go(p)}
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
						onclick={() => go(pagination.currentPage + 1)}
						disabled={pagination.currentPage >= totalPages}
						class="inline-flex h-9 min-w-9 items-center justify-center border border-slate-200 bg-white px-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-100 disabled:text-slate-300"
						aria-label="下一页"
					>
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
							><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"
							></path></svg
						>
					</button>
				</nav>
			{/if}
		</div>
	{/if}

	{#if footer}
		{@render footer()}
	{/if}
</div>
