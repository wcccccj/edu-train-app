import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import DataTable from './DataTable.svelte';
import DataTableHarness from './DataTableHarness.svelte';
import type { Column } from './table.types';
import type { Component } from 'svelte';

interface Row {
	id: string;
	courseName: string;
	type: string;
	status: string;
}

const rows: Row[] = [
	{ id: '1', courseName: 'Svelte 5 核心特性', type: 'online', status: 'approved' },
	{ id: '2', courseName: 'Tailwind 实战', type: 'offline', status: 'pending' }
];

const columns: Column<Row>[] = [
	{ key: 'courseName', title: '课程名称', width: 200, ellipsis: true },
	{ key: 'type', title: '培训类型', width: '30%', align: 'center' },
	{ key: 'status', title: '状态' }
];

/**
 * @testing-library/svelte 的 render 不感知 Svelte 5 泛型组件（会将 T 推断为 unknown），
 * 此处用泛型包装恢复类型推断。
 */
function renderTable<T>(data: T[], columns: Column<T>[], extra: Record<string, unknown> = {}) {
	return render(
		DataTable as unknown as Component<{ data: T[]; columns: Column<T>[]; [key: string]: unknown }>,
		{ props: { data, columns, ...extra } }
	);
}

describe('DataTable · 基础渲染', () => {
	it('根据列配置渲染表头', () => {
		renderTable(rows, columns);
		expect(screen.getByRole('table')).toBeInTheDocument();
		expect(screen.getByRole('columnheader', { name: '课程名称' })).toBeInTheDocument();
		expect(screen.getByRole('columnheader', { name: '培训类型' })).toBeInTheDocument();
		expect(screen.getByRole('columnheader', { name: '状态' })).toBeInTheDocument();
	});

	it('默认按列 key 渲染单元格文本', () => {
		renderTable(rows, columns);
		expect(screen.getByText('Svelte 5 核心特性')).toBeInTheDocument();
		expect(screen.getByText('online')).toBeInTheDocument();
		expect(screen.getByText('approved')).toBeInTheDocument();
	});

	it('空数组时渲染 Element Plus 风格空状态：插图 + 提示文案', () => {
		const { container } = renderTable([], columns, { emptyText: '暂无记录' });
		expect(screen.getByText('暂无记录')).toBeInTheDocument();
		const svg = container.querySelector('td div svg');
		expect(svg).not.toBeNull();
		expect(svg!.classList.contains('text-slate-200')).toBe(true);
	});

	it('未传 emptyText 时使用默认文案「暂无数据」', () => {
		renderTable([], columns);
		expect(screen.getByText('暂无数据')).toBeInTheDocument();
	});

	it('empty 插槽完全覆盖默认空状态', () => {
		render(DataTableHarness, { props: { data: [], columns } });
		expect(screen.getByText('自定义空状态')).toBeInTheDocument();
		expect(screen.queryByText('暂无数据')).not.toBeInTheDocument();
	});

	it('loading 为 true 时渲染加载态', () => {
		renderTable(rows, columns, { loading: true });
		expect(screen.getByText('加载中…')).toBeInTheDocument();
	});
});

describe('DataTable · 自定义单元格插槽', () => {
	it('snippets 逐列渲染：状态列渲染徽章，其余列走声明式默认', () => {
		const { container } = render(DataTableHarness, { props: { data: rows, columns } });
		expect(screen.getByText('approved')).toBeInTheDocument();
		const badges = container.querySelectorAll('span.badge-status');
		expect(badges.length).toBe(2);
		expect(badges[0].textContent).toBe('approved');
	});
});

describe('DataTable · 声明式列配置', () => {
	it('map：将原始值映射为标签文案', () => {
		const cols: Column<Row>[] = [
			{ key: 'type', title: '类型', map: { online: '线上', offline: '线下' } }
		];
		renderTable(rows, cols);
		expect(screen.getByText('线上')).toBeInTheDocument();
		expect(screen.getByText('线下')).toBeInTheDocument();
	});

	it('fallback：空值展示兜底文本', () => {
		const empty: Row[] = [{ id: '1', courseName: '', type: 'online', status: 'pending' }];
		const cols: Column<Row>[] = [{ key: 'courseName', title: '课程', fallback: '—' }];
		renderTable(empty, cols);
		expect(screen.getByText('—')).toBeInTheDocument();
	});

	it('formatter：对单元格值进行格式化', () => {
		const cols: Column<Row>[] = [
			{ key: 'status', title: '状态', formatter: (v) => `[${String(v)}]` }
		];
		renderTable(rows, cols);
		expect(screen.getByText('[approved]')).toBeInTheDocument();
		expect(screen.getByText('[pending]')).toBeInTheDocument();
	});

	it('formatter：可访问整行数据', () => {
		const cols: Column<Row>[] = [
			{ key: 'type', title: '类型', formatter: (_v, row) => `${row.courseName}·${row.type}` }
		];
		renderTable(rows, cols);
		expect(screen.getByText('Svelte 5 核心特性·online')).toBeInTheDocument();
	});

	it('优先级：snippets > 声明式 formatter', () => {
		const cols: Column<Row>[] = [
			{ key: 'status', title: '状态', formatter: (v) => `fmt:${String(v)}` }
		];
		render(DataTableHarness, {
			props: { data: rows, columns: cols, useOverrideSnippet: true }
		});
		expect(screen.getByText('snippet:approved')).toBeInTheDocument();
		expect(screen.getByText('snippet:pending')).toBeInTheDocument();
		expect(screen.queryByText('fmt:approved')).not.toBeInTheDocument();
	});
});

describe('DataTable · 全局 cell 兜底插槽', () => {
	it('未提供 snippets 时，cell 插槽仍可全局自定义', () => {
		render(DataTableHarness, {
			props: { data: rows, columns: columns, useCellFallback: true }
		});
		// cell 为全局兜底插槽，作用于所有未配置逐列插槽的列
		expect(screen.getAllByText('自定义:Svelte 5 核心特性').length).toBeGreaterThan(0);
	});
});

describe('DataTable · 列宽自定义', () => {
	it('固定像素宽度生成 width + min-width 内联样式', () => {
		renderTable(rows, columns);
		const th = screen.getByRole('columnheader', { name: '课程名称' });
		expect(th.style.width).toBe('200px');
		expect(th.style.minWidth).toBe('200px');
	});

	it('百分比宽度生成 width 内联样式', () => {
		renderTable(rows, columns);
		const th = screen.getByRole('columnheader', { name: '培训类型' });
		expect(th.style.width).toBe('30%');
	});

	it('自适应(auto)列不生成宽度内联样式', () => {
		renderTable(rows, columns);
		const th = screen.getByRole('columnheader', { name: '状态' });
		expect(th.style.width).toBe('');
	});

	it('min/max 范围宽度生成 min-width 与 max-width', () => {
		const cols: Column<Row>[] = [{ key: 'status', title: '状态', width: { min: 80, max: 160 } }];
		renderTable(rows, cols);
		const th = screen.getByRole('columnheader', { name: '状态' });
		expect(th.style.minWidth).toBe('80px');
		expect(th.style.maxWidth).toBe('160px');
	});

	it('对齐方式：center 应用到表头与单元格', () => {
		renderTable(rows, columns);
		const th = screen.getByRole('columnheader', { name: '培训类型' });
		expect(th.classList.contains('text-center')).toBe(true);
	});
});

describe('DataTable · 省略显示', () => {
	it('尾部省略：单元格包裹省略容器并携带 title 完整文本', () => {
		renderTable(rows, columns);
		const cell = screen.getByText('Svelte 5 核心特性').closest('div');
		expect(cell).not.toBeNull();
		expect(cell!.classList.contains('text-ellipsis')).toBe(true);
		expect(cell!.classList.contains('whitespace-nowrap')).toBe(true);
		expect(cell!.getAttribute('title')).toBe('Svelte 5 核心特性');
	});

	it('中部省略：渲染前裁剪文本并插入省略符号', () => {
		const longRow: Row[] = [
			{ id: '1', courseName: 'x', type: 'online', status: 'approved-pending-waiting' }
		];
		const cols: Column<Row>[] = [
			{
				key: 'status',
				title: '状态',
				ellipsis: { position: 'middle', symbol: '...', headChars: 4, tailChars: 4 }
			}
		];
		renderTable(longRow, cols);
		expect(screen.getByText('appr...ting')).toBeInTheDocument();
	});

	it('头部省略：生成 RTL 内联样式', () => {
		const cols: Column<Row>[] = [{ key: 'status', title: '状态', ellipsis: { position: 'head' } }];
		renderTable(rows, cols);
		const cell = screen.getByText('approved').closest('div');
		expect(cell!.style.direction).toBe('rtl');
	});

	it('showTooltip 关闭时不渲染 title', () => {
		const cols: Column<Row>[] = [
			{ key: 'status', title: '状态', ellipsis: { showTooltip: false } }
		];
		renderTable(rows, cols);
		const cell = screen.getByText('approved').closest('div');
		expect(cell!.hasAttribute('title')).toBe(false);
	});
});

describe('DataTable · 分页', () => {
	it('按 pageSize 切片展示，并显示总条数', () => {
		const pagination = { currentPage: 1, pageSize: 1, onPageChange: vi.fn() };
		renderTable(rows, columns, { pagination });
		expect(screen.getByText('Svelte 5 核心特性')).toBeInTheDocument();
		expect(screen.queryByText('Tailwind 实战')).not.toBeInTheDocument();
		expect(screen.getByText('共 2 条')).toBeInTheDocument();
	});

	it('点击页码触发 onPageChange', async () => {
		const pagination = { currentPage: 1, pageSize: 1, onPageChange: vi.fn() };
		renderTable(rows, columns, { pagination });
		const page2 = screen.getByRole('button', { name: '2' });
		await fireEvent.click(page2);
		expect(pagination.onPageChange).toHaveBeenCalledWith(2);
	});

	it('仅一页时不渲染页码导航栏，但仍显示总条数', () => {
		const pagination = { currentPage: 1, pageSize: 10, onPageChange: vi.fn() };
		const { container } = renderTable(rows, columns, { pagination });
		expect(container.querySelector('nav')).toBeNull();
		expect(screen.getByText('共 2 条')).toBeInTheDocument();
	});
});

describe('DataTable · 样式一致性', () => {
	it('striped 开启时偶数行应用斑马纹', () => {
		const { container } = renderTable(rows, columns, { striped: true });
		const bodyRows = container.querySelectorAll('tbody tr');
		expect(bodyRows[1].classList.contains('bg-slate-50/60')).toBe(true);
	});

	it('未开启 striped 时偶数行无斑马纹类', () => {
		const { container } = renderTable(rows, columns);
		const bodyRows = container.querySelectorAll('tbody tr');
		expect(bodyRows[1].classList.contains('bg-slate-50/60')).toBe(false);
	});

	it('每行应用 hover 过渡类，保证交互一致性', () => {
		const { container } = renderTable(rows, columns);
		const bodyRows = container.querySelectorAll('tbody tr');
		bodyRows.forEach((tr) => {
			expect(tr.classList.contains('transition-colors')).toBe(true);
			expect(tr.classList.contains('hover:bg-slate-50')).toBe(true);
		});
	});
});
