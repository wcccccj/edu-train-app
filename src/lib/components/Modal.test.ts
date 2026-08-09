import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import ModalHarness, { type HarnessProps } from './ModalHarness.svelte';

function renderModal(overrides: Partial<HarnessProps> = {}) {
	const onClose = vi.fn();
	const utils = render(ModalHarness, {
		title: '报名表单',
		onClose,
		...overrides
	});
	return { onClose, ...utils };
}

describe('Modal 通用弹窗组件', () => {
	it('open 为 true 时渲染标题、内容与关闭按钮', () => {
		renderModal();
		expect(screen.getByRole('heading', { name: '报名表单' })).toBeInTheDocument();
		expect(screen.getByText('弹窗主体内容')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: '关闭' })).toBeInTheDocument();
	});

	it('open 为 false 时完全不渲染弹窗结构', () => {
		renderModal({ open: false });
		expect(screen.queryByRole('heading', { name: '报名表单' })).not.toBeInTheDocument();
		expect(screen.queryByText('弹窗主体内容')).not.toBeInTheDocument();
	});

	it('点击遮罩层触发 onClose', () => {
		const { container, onClose } = renderModal();
		// 遮罩层为根容器下的第一个 div（absolute inset-0 背景层）
		const overlay = container.querySelector('.fixed.inset-0.z-40 > div');
		expect(overlay).not.toBeNull();
		fireEvent.click(overlay as HTMLElement);
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('点击右上角关闭按钮触发 onClose', () => {
		const { onClose } = renderModal();
		fireEvent.click(screen.getByRole('button', { name: '关闭' }));
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('默认 maxWidth 为 lg，应用 max-w-lg 类', () => {
		const { container } = renderModal();
		expect(container.querySelector('.max-w-lg')).not.toBeNull();
	});

	it.each([
		['sm', 'max-w-sm'],
		['md', 'max-w-md'],
		['lg', 'max-w-lg'],
		['xl', 'max-w-xl'],
		['2xl', 'max-w-2xl'],
		['3xl', 'max-w-3xl']
	] as const)('maxWidth=%s 时应用 %s 类', (width, expectedClass) => {
		const { container } = renderModal({ maxWidth: width });
		expect(container.querySelector(`.${expectedClass}`)).not.toBeNull();
	});

	it('传入 header 插槽时渲染头部信息区', () => {
		renderModal({ useHeader: true });
		expect(screen.getByText('头部提示信息')).toBeInTheDocument();
	});

	it('未传入 header 插槽时不渲染头部信息区', () => {
		const { container } = renderModal();
		expect(container.querySelector('.bg-slate-50')).toBeNull();
	});
});
