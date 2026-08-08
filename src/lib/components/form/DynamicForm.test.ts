import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import DynamicForm from './DynamicForm.svelte';
import { z } from 'zod';
import type { SectionedFormSchema } from './form.types';

describe('DynamicForm', () => {
	const mockSchema: SectionedFormSchema = {
		sections: [
			{
				id: 'basic',
				title: '基础信息',
				fields: [
					{ name: 'name', label: '姓名', type: 'text', placeholder: '请输入姓名' },
					{ name: 'phone', label: '联系电话', type: 'tel', placeholder: '请输入电话' }
				]
			}
		],
		validationSchema: z.object({
			name: z.string().min(1, '姓名不能为空'),
			phone: z.string().regex(/^1[3-9]\d{9}$/, '电话格式不正确')
		})
	};

	it('should render form fields based on schema', () => {
		render(DynamicForm, {
			schema: mockSchema,
			initialData: {},
			onSubmit: vi.fn()
		});

		expect(screen.getByLabelText('姓名')).toBeInTheDocument();
		expect(screen.getByPlaceholderText('请输入姓名')).toBeInTheDocument();
		expect(screen.getByLabelText('联系电话')).toBeInTheDocument();
		expect(screen.getByPlaceholderText('请输入电话')).toBeInTheDocument();
	});

	it('should show validation errors on submit with invalid data', async () => {
		const onSubmit = vi.fn();
		render(DynamicForm, {
			schema: mockSchema,
			initialData: {},
			onSubmit
		});

		const submitBtn = screen.getByRole('button', { name: '提交' });
		await fireEvent.click(submitBtn);

		expect(onSubmit).not.toHaveBeenCalled();
		expect(await screen.findByText('姓名不能为空')).toBeInTheDocument();
		expect(await screen.findByText('电话格式不正确')).toBeInTheDocument();
	});

	it('should call onSubmit with form data when valid', async () => {
		const onSubmit = vi.fn();
		render(DynamicForm, {
			schema: mockSchema,
			initialData: {},
			onSubmit
		});

		const nameInput = screen.getByLabelText('姓名');
		const phoneInput = screen.getByLabelText('联系电话');

		await fireEvent.input(nameInput, { target: { value: '张三' } });
		await fireEvent.input(phoneInput, { target: { value: '13812345678' } });

		const submitBtn = screen.getByRole('button', { name: '提交' });
		await fireEvent.click(submitBtn);

		expect(onSubmit).toHaveBeenCalledWith({
			name: '张三',
			phone: '13812345678'
		});
	});

	it('should render initial data correctly', () => {
		render(DynamicForm, {
			schema: mockSchema,
			initialData: { name: '李四', phone: '13987654321' },
			onSubmit: vi.fn()
		});

		const nameInput = screen.getByLabelText('姓名') as HTMLInputElement;
		const phoneInput = screen.getByLabelText('联系电话') as HTMLInputElement;

		expect(nameInput.value).toBe('李四');
		expect(phoneInput.value).toBe('13987654321');
	});

	it('should respect disabled field property', () => {
		const disabledSchema: SectionedFormSchema = {
			sections: [
				{
					id: 'basic',
					title: '基础信息',
					fields: [{ name: 'name', label: '姓名', type: 'text', disabled: true }]
				}
			],
			validationSchema: z.object({ name: z.string() })
		};

		render(DynamicForm, {
			schema: disabledSchema,
			initialData: {},
			onSubmit: vi.fn()
		});

		const nameInput = screen.getByLabelText('姓名') as HTMLInputElement;
		expect(nameInput.disabled).toBe(true);
	});

	it('should auto-fill single-option select fields', () => {
		const singleOptionSchema: SectionedFormSchema = {
			sections: [
				{
					id: 'test',
					title: '测试',
					fields: [
						{
							name: 'location',
							label: '地点',
							type: 'select',
							required: true,
							options: [{ label: '唯一地点', value: 'only' }]
						}
					]
				}
			],
			validationSchema: z.object({
				location: z.string().min(1)
			})
		};

		const { container } = render(DynamicForm, {
			schema: singleOptionSchema,
			initialData: {},
			onSubmit: vi.fn()
		});

		const select = container.querySelector('select') as HTMLSelectElement;
		expect(select.value).toBe('only');
	});

	it('should NOT auto-fill multi-option select fields', () => {
		const multiOptionSchema: SectionedFormSchema = {
			sections: [
				{
					id: 'test',
					title: '测试',
					fields: [
						{
							name: 'location',
							label: '地点',
							type: 'select',
							required: true,
							options: [
								{ label: '地点 A', value: 'a' },
								{ label: '地点 B', value: 'b' }
							]
						}
					]
				}
			],
			validationSchema: z.object({
				location: z.string().min(1)
			})
		};

		const { container } = render(DynamicForm, {
			schema: multiOptionSchema,
			initialData: {},
			onSubmit: vi.fn()
		});

		const select = container.querySelector('select') as HTMLSelectElement;
		expect(select.value).toBe('');
	});

	it('should allow single-option auto-filled field to submit without manual selection', async () => {
		const onSubmit = vi.fn();
		const singleOptionSchema: SectionedFormSchema = {
			sections: [
				{
					id: 'test',
					title: '测试',
					fields: [
						{ name: 'name', label: '姓名', type: 'text', required: true },
						{
							name: 'location',
							label: '地点',
							type: 'select',
							required: true,
							options: [{ label: '唯一地点', value: 'only' }]
						}
					]
				}
			],
			validationSchema: z.object({
				name: z.string().min(1),
				location: z.string().min(1)
			})
		};

		const { container } = render(DynamicForm, {
			schema: singleOptionSchema,
			initialData: {},
			onSubmit
		});

		const nameInput = container.querySelector('input[name="name"]') as HTMLInputElement;
		await fireEvent.input(nameInput, { target: { value: '测试' } });
		await fireEvent.click(container.querySelector('button[type="submit"]')!);

		expect(onSubmit).toHaveBeenCalledWith({
			name: '测试',
			location: 'only'
		});
	});
});
