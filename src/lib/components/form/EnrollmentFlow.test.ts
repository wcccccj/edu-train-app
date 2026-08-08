import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import EnrollmentFlow from './EnrollmentFlow.svelte';
import { z } from 'zod';
import type { SectionedFormSchema } from './form.types';

describe('EnrollmentFlow', () => {
	const mockSchema: SectionedFormSchema = {
		sections: [
			{
				id: 'basic',
				title: '通用资料',
				fields: [
					{ name: 'name', label: '姓名', type: 'text' as const },
					{ name: 'phone', label: '电话', type: 'tel' as const }
				]
			}
		],
		validationSchema: z.object({
			name: z.string().min(1),
			phone: z.string().min(1)
		})
	};

	beforeEach(() => {
		sessionStorage.clear();
		localStorage.clear();
	});

	it('should render form initially', () => {
		render(EnrollmentFlow, {
			schema: mockSchema,
			sessionKey: 'test-flow',
			onComplete: vi.fn()
		});

		expect(screen.getByLabelText('姓名')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: '保存信息' })).toBeInTheDocument();
	});

	it('should flow from form to preview and back to form', async () => {
		const onComplete = vi.fn();
		render(EnrollmentFlow, {
			schema: mockSchema,
			sessionKey: 'test-flow',
			onComplete
		});

		// Fill form
		await fireEvent.input(screen.getByLabelText('姓名'), { target: { value: '张三' } });
		await fireEvent.input(screen.getByLabelText('电话'), { target: { value: '138' } });

		// Submit to preview
		await fireEvent.click(screen.getByRole('button', { name: '保存信息' }));

		// Should be in preview
		expect(await screen.findByText('信息预览')).toBeInTheDocument();
		expect(screen.getByText('张三')).toBeInTheDocument();
		expect(screen.getByText('138')).toBeInTheDocument();

		// Go back to edit
		const editBtns = screen.getAllByRole('button', { name: '修改' });
		await fireEvent.click(editBtns[0]); // Click first "修改" button next to field

		// Should be back to form with data preserved
		expect(await screen.findByLabelText('姓名')).toBeInTheDocument();
		expect((screen.getByLabelText('姓名') as HTMLInputElement).value).toBe('张三');
	});

	it('should complete flow and clear session', async () => {
		const onComplete = vi.fn();
		render(EnrollmentFlow, {
			schema: mockSchema,
			sessionKey: 'test-flow',
			onComplete
		});

		// Form
		await fireEvent.input(screen.getByLabelText('姓名'), { target: { value: '李四' } });
		await fireEvent.input(screen.getByLabelText('电话'), { target: { value: '139' } });
		await fireEvent.click(screen.getByRole('button', { name: '保存信息' }));

		// Preview
		expect(await screen.findByText('信息预览')).toBeInTheDocument();
		await fireEvent.click(screen.getByRole('button', { name: '确认提交' }));

		expect(onComplete).toHaveBeenCalledWith({ name: '李四', phone: '139' });
		expect(sessionStorage.getItem('test-flow')).toBeNull();
	});

	it('should show success state after completion', async () => {
		const onComplete = vi.fn();
		render(EnrollmentFlow, {
			schema: mockSchema,
			sessionKey: 'test-flow',
			onComplete
		});

		// Fill and submit
		await fireEvent.input(screen.getByLabelText('姓名'), { target: { value: '王五' } });
		await fireEvent.input(screen.getByLabelText('电话'), { target: { value: '137' } });
		await fireEvent.click(screen.getByRole('button', { name: '保存信息' }));
		await fireEvent.click(screen.getByRole('button', { name: '确认提交' }));

		expect(await screen.findByText('报名成功')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: '返回重新报名' })).toBeInTheDocument();
	});

	it('should show error message when onComplete throws', async () => {
		const onComplete = vi.fn(() => {
			throw new Error('名额已满');
		});
		render(EnrollmentFlow, {
			schema: mockSchema,
			sessionKey: 'test-flow',
			onComplete
		});

		// Fill and submit
		await fireEvent.input(screen.getByLabelText('姓名'), { target: { value: '赵六' } });
		await fireEvent.input(screen.getByLabelText('电话'), { target: { value: '136' } });
		await fireEvent.click(screen.getByRole('button', { name: '保存信息' }));
		await fireEvent.click(screen.getByRole('button', { name: '确认提交' }));

		expect(await screen.findByText('名额已满')).toBeInTheDocument();
		// Should still be in preview mode, not success
		expect(screen.getByText('信息预览')).toBeInTheDocument();
	});

	it('should support async onComplete returning a Promise', async () => {
		const onComplete = vi.fn(() => Promise.resolve());
		render(EnrollmentFlow, {
			schema: mockSchema,
			sessionKey: 'test-flow',
			onComplete
		});

		await fireEvent.input(screen.getByLabelText('姓名'), { target: { value: '钱七' } });
		await fireEvent.input(screen.getByLabelText('电话'), { target: { value: '135' } });
		await fireEvent.click(screen.getByRole('button', { name: '保存信息' }));
		await fireEvent.click(screen.getByRole('button', { name: '确认提交' }));

		expect(onComplete).toHaveBeenCalledWith({ name: '钱七', phone: '135' });
		expect(await screen.findByText('报名成功')).toBeInTheDocument();
	});

	it('should show error when async onComplete rejects', async () => {
		const onComplete = vi.fn(() => Promise.reject(new Error('网络错误')));
		render(EnrollmentFlow, {
			schema: mockSchema,
			sessionKey: 'test-flow',
			onComplete
		});

		await fireEvent.input(screen.getByLabelText('姓名'), { target: { value: '孙八' } });
		await fireEvent.input(screen.getByLabelText('电话'), { target: { value: '134' } });
		await fireEvent.click(screen.getByRole('button', { name: '保存信息' }));
		await fireEvent.click(screen.getByRole('button', { name: '确认提交' }));

		expect(await screen.findByText('网络错误')).toBeInTheDocument();
	});

	it('should pass onCancel to DynamicForm as cancel button', () => {
		const onCancel = vi.fn();
		render(EnrollmentFlow, {
			schema: mockSchema,
			sessionKey: 'test-flow',
			onComplete: vi.fn(),
			onCancel
		});

		const cancelBtn = screen.getByRole('button', { name: '取消' });
		expect(cancelBtn).toBeInTheDocument();
	});

	it('should show "完成" button in success state when onCancel is provided', async () => {
		const onCancel = vi.fn();
		render(EnrollmentFlow, {
			schema: mockSchema,
			sessionKey: 'test-flow',
			onComplete: vi.fn(),
			onCancel
		});

		await fireEvent.input(screen.getByLabelText('姓名'), { target: { value: '周九' } });
		await fireEvent.input(screen.getByLabelText('电话'), { target: { value: '133' } });
		await fireEvent.click(screen.getByRole('button', { name: '保存信息' }));
		await fireEvent.click(screen.getByRole('button', { name: '确认提交' }));

		const doneBtn = await screen.findByRole('button', { name: '完成' });
		expect(doneBtn).toBeInTheDocument();

		await fireEvent.click(doneBtn);
		expect(onCancel).toHaveBeenCalledTimes(1);
	});

	it('should allow retry after error', async () => {
		let shouldFail = true;
		const onComplete = vi.fn(() => {
			if (shouldFail) throw new Error('第一次失败');
		});
		render(EnrollmentFlow, {
			schema: mockSchema,
			sessionKey: 'test-flow',
			onComplete
		});

		// First attempt - fails
		await fireEvent.input(screen.getByLabelText('姓名'), { target: { value: '吴十' } });
		await fireEvent.input(screen.getByLabelText('电话'), { target: { value: '132' } });
		await fireEvent.click(screen.getByRole('button', { name: '保存信息' }));
		await fireEvent.click(screen.getByRole('button', { name: '确认提交' }));

		expect(await screen.findByText('第一次失败')).toBeInTheDocument();

		// Retry - succeeds
		shouldFail = false;
		await fireEvent.click(screen.getByRole('button', { name: '确认提交' }));

		expect(await screen.findByText('报名成功')).toBeInTheDocument();
	});
});
