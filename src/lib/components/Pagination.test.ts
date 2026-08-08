import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import Pagination, { type PaginationProps } from './Pagination.svelte';

function setup(props: Partial<PaginationProps> = {}) {
	const onPageChange = vi.fn();
	render(Pagination, {
		totalItems: 100,
		pageSize: 10,
		currentPage: 1,
		onPageChange,
		...props
	});
	return { onPageChange };
}

describe('Pagination 通用分页组件', () => {
	it('总页数为 1 时不渲染控件', () => {
		render(Pagination, { totalItems: 8, pageSize: 10, currentPage: 1 });
		expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
	});

	it('根据数据总量与每页条数计算并渲染页码按钮', () => {
		setup({ totalItems: 30, pageSize: 10 });
		expect(screen.getByRole('navigation')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument();
	});

	it('当前页高亮并标记 aria-current', () => {
		setup({ currentPage: 2 });
		const active = screen.getByRole('button', { name: '2' });
		expect(active).toHaveAttribute('aria-current', 'page');
	});

	it('点击页码触发 onPageChange 回调', () => {
		const { onPageChange } = setup({ currentPage: 1 });
		fireEvent.click(screen.getByRole('button', { name: '3' }));
		expect(onPageChange).toHaveBeenCalledWith(3);
	});

	it('上一页/下一页按钮触发回调并在边界禁用', () => {
		const { onPageChange } = setup({ currentPage: 1 });
		// 第一页时「上一页」禁用
		expect(screen.getByRole('button', { name: '上一页' })).toBeDisabled();
		fireEvent.click(screen.getByRole('button', { name: '下一页' }));
		expect(onPageChange).toHaveBeenCalledWith(2);
	});

	it('末页时「下一页」禁用', () => {
		setup({ currentPage: 10 });
		expect(screen.getByRole('button', { name: '下一页' })).toBeDisabled();
	});

	it('可直接跳转到指定页码并触发回调', () => {
		const { onPageChange } = setup();
		const input = screen.getByRole('spinbutton', { name: '跳转页码输入' });
		fireEvent.input(input, { target: { value: '5' } });
		fireEvent.click(screen.getByRole('button', { name: '确定' }));
		expect(onPageChange).toHaveBeenCalledWith(5);
	});

	it('跳转输入支持回车触发', () => {
		const { onPageChange } = setup();
		const input = screen.getByRole('spinbutton', { name: '跳转页码输入' });
		fireEvent.input(input, { target: { value: '7' } });
		fireEvent.keyDown(input, { key: 'Enter' });
		expect(onPageChange).toHaveBeenCalledWith(7);
	});

	it('跳转页码超界时收敛到合法范围', () => {
		const { onPageChange } = setup();
		const input = screen.getByRole('spinbutton', { name: '跳转页码输入' });
		fireEvent.input(input, { target: { value: '99' } });
		fireEvent.click(screen.getByRole('button', { name: '确定' }));
		expect(onPageChange).toHaveBeenCalledWith(10);
	});

	it('支持自定义页码展示数量（溢出时折叠省略号）', () => {
		setup({ totalItems: 100, pageSize: 1, maxVisiblePages: 5 });
		// 5 个页码按钮 + 省略号
		expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
		expect(screen.getByText('…')).toBeInTheDocument();
	});

	it('启用 showTotal 时展示数据总量', () => {
		setup({ showTotal: true });
		expect(screen.getByText('共 100 条')).toBeInTheDocument();
	});

	it('关闭 showJump 时不渲染跳转输入框', () => {
		setup({ showJump: false });
		expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
	});
});
