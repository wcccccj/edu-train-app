<script lang="ts">
	import DataTable from './DataTable.svelte';
	import type { Column, PaginationConfig } from './table.types';

	export interface HarnessRow {
		id: string;
		courseName: string;
		type: string;
		status: string;
	}

	// 仅用于单元测试：通过真实 {#snippet} 验证插槽 API 与优先级
	let {
		data = [] as HarnessRow[],
		columns = [] as Column<HarnessRow>[],
		pagination,
		useOverrideSnippet = false,
		useCellFallback = false
	}: {
		data?: HarnessRow[];
		columns?: Column<HarnessRow>[];
		pagination?: PaginationConfig;
		/** 为 status 列注入「snippet:」前缀插槽，用于验证 snippets 高于 formatter 的优先级 */
		useOverrideSnippet?: boolean;
		/** 仅传入全局 cell 兜底插槽，验证无逐列插槽时的全局自定义渲染 */
		useCellFallback?: boolean;
	} = $props();

	let effectiveSnippets = $derived(
		useOverrideSnippet ? { status: overrideStatusCell } : { status: statusCell }
	);
	let effectiveCell = $derived(useCellFallback ? cellFallback : undefined);
</script>

{#snippet statusCell(row: HarnessRow)}
	<span class="badge-status">{row.status}</span>
{/snippet}
{#snippet overrideStatusCell(row: HarnessRow)}
	<span>snippet:{row.status}</span>
{/snippet}
{#snippet cellFallback(row: HarnessRow)}
	<span>自定义:{row.courseName}</span>
{/snippet}
{#snippet emptyCell()}
	<div class="custom-empty">自定义空状态</div>
{/snippet}

<DataTable
	{data}
	{columns}
	{pagination}
	rowKey="id"
	snippets={effectiveSnippets}
	cell={effectiveCell}
	empty={emptyCell}
/>
