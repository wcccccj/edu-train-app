import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import Preview from './Preview.svelte';
import type { SectionedFormSchema, FormValues } from './form.types';

const schema = {
	sections: [
		{
			id: 'base',
			title: '基本信息',
			fields: [
				{ name: 'name', label: '姓名', type: 'text' },
				{
					name: 'type',
					label: '课程类型',
					type: 'select',
					options: [
						{ label: '线上', value: 'online' },
						{ label: '线下', value: 'offline' }
					]
				}
			]
		},
		{
			id: 'contact',
			title: '联系信息',
			fields: [{ name: 'phone', label: '电话', type: 'tel' }]
		}
	],
	validationSchema: {} as never
} as unknown as SectionedFormSchema;

const data: FormValues = { name: '张三', type: 'online', phone: '13800138000' };

function renderPreview(overrides: Record<string, unknown> = {}) {
	const onEdit = vi.fn();
	const onSubmit = vi.fn();
	const utils = render(Preview, {
		schema,
		data,
		onEdit,
		onSubmit,
		...overrides
	});
	return { onEdit, onSubmit, ...utils };
}

describe('Preview 报名信息预览组件', () => {
	it('按分区渲染分区标题与字段标签', () => {
		renderPreview();
		expect(screen.getByText('基本信息')).toBeInTheDocument();
		expect(screen.getByText('联系信息')).toBeInTheDocument();
		expect(screen.getByText('姓名')).toBeInTheDocument();
		expect(screen.getByText('电话')).toBeInTheDocument();
	});

	it('渲染普通文本字段的原始值', () => {
		renderPreview();
		expect(screen.getByText('张三')).toBeInTheDocument();
		expect(screen.getByText('13800138000')).toBeInTheDocument();
	});

	it('select 字段展示选项 label 而非原始 value', () => {
		renderPreview();
		expect(screen.getByText('线上')).toBeInTheDocument();
		expect(screen.queryByText('online')).not.toBeInTheDocument();
	});

	it('值为空时展示占位符 -', () => {
		renderPreview({ data: { name: '', type: 'online', phone: undefined } });
		// name 空 → '-'，phone 空 → '-'，type 有值 → 线上
		expect(screen.getAllByText('-').length).toBeGreaterThanOrEqual(2);
	});

	it('点击字段旁的「修改」按钮调用 onEdit 并传入字段名', () => {
		const { onEdit } = renderPreview();
		const editButtons = screen.getAllByText('修改');
		fireEvent.click(editButtons[0]);
		expect(onEdit).toHaveBeenCalledWith('name');
	});

	it('点击底部「修改信息」按钮调用 onEdit 且不传参', () => {
		const { onEdit } = renderPreview();
		fireEvent.click(screen.getByRole('button', { name: '修改信息' }));
		expect(onEdit).toHaveBeenCalledTimes(1);
		expect(onEdit).toHaveBeenCalledWith();
	});

	it('点击提交按钮调用 onSubmit', () => {
		const { onSubmit } = renderPreview();
		fireEvent.click(screen.getByRole('button', { name: '确认提交' }));
		expect(onSubmit).toHaveBeenCalledTimes(1);
	});

	it('支持自定义提交与修改文案', () => {
		renderPreview({ submitText: '保存信息', editText: '返回编辑' });
		expect(screen.getByRole('button', { name: '保存信息' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: '返回编辑' })).toBeInTheDocument();
	});

	it('isSubmitting 为 true 时展示提交中并禁用按钮', () => {
		const { onEdit, onSubmit } = renderPreview({ isSubmitting: true });
		expect(screen.getByText('提交中...')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /提交中/ })).toBeDisabled();
		expect(screen.getByRole('button', { name: '修改信息' })).toBeDisabled();
		fireEvent.click(screen.getByRole('button', { name: '修改信息' }));
		expect(onEdit).not.toHaveBeenCalled();
		fireEvent.click(screen.getByRole('button', { name: /提交中/ }));
		expect(onSubmit).not.toHaveBeenCalled();
	});
});
