import { render, cleanup } from '@testing-library/svelte';
import { describe, it, expect, vi, afterEach } from 'vitest';
import Chart from './Chart.svelte';
import * as echarts from 'echarts';

// 模拟 echarts
vi.mock('echarts', () => {
	const mockInstance = {
		setOption: vi.fn(),
		resize: vi.fn(),
		dispose: vi.fn()
	};
	return {
		init: vi.fn(() => mockInstance)
	};
});

describe('Chart.svelte', () => {
	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	it('should render chart container and initialize echarts on mount', () => {
		const options = {
			title: { text: 'Test Chart' }
		};

		const { container } = render(Chart, {
			props: {
				options,
				class: 'test-class'
			}
		});

		const div = container.querySelector('div');
		expect(div).toBeInTheDocument();
		expect(div).toHaveClass('test-class');

		// 验证 echarts.init 被调用
		expect(echarts.init).toHaveBeenCalledWith(div);

		// 验证 setOption 被调用
		const mockInstance = vi.mocked(echarts.init).mock.results[0].value;
		expect(mockInstance.setOption).toHaveBeenCalledWith(options);
	});

	it('should trigger resize when ResizeObserver callback is called', () => {
		const options = {
			title: { text: 'Test Chart' }
		};

		// 捕获传递给 ResizeObserver 的回调
		let observerCallback: (() => void) | null = null;
		const originalResizeObserver = global.ResizeObserver;

		global.ResizeObserver = class {
			constructor(cb: () => void) {
				observerCallback = cb;
			}
			observe = vi.fn();
			unobserve = vi.fn();
			disconnect = vi.fn();
		} as any;

		render(Chart, {
			props: { options }
		});

		// 模拟窗口 resize 触发回调
		if (observerCallback) {
			observerCallback();
		}

		const mockInstance = vi.mocked(echarts.init).mock.results[0].value;
		expect(mockInstance.resize).toHaveBeenCalled();

		// 恢复原有的 ResizeObserver
		global.ResizeObserver = originalResizeObserver;
	});

	it('should dispose chart instance on destroy', () => {
		const options = {
			title: { text: 'Test Chart' }
		};

		const { unmount } = render(Chart, {
			props: { options }
		});

		const mockInstance = vi.mocked(echarts.init).mock.results[0].value;
		unmount();

		// 验证 dispose 被调用
		expect(mockInstance.dispose).toHaveBeenCalled();
	});
});
