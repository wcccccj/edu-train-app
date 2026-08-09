import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Web Animations API
// 注意：使用普通函数而非 vi.fn()，避免 vi.resetAllMocks() 将其重置为返回 undefined，
// 否则 Svelte 过渡动画在 animation 为 undefined 时赋值 onfinish 会抛异常。
if (typeof Element !== 'undefined') {
	// 通过类型断言满足 Element.animate 的 Animation 返回类型（happy-dom 缺少完整实现）
	Element.prototype.animate = (() => ({
		finished: Promise.resolve(),
		cancel: () => {},
		play: () => {},
		pause: () => {},
		set onfinish(cb: () => void) {
			setTimeout(cb, 0);
		}
	})) as unknown as typeof Element.prototype.animate;
}

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: vi.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn()
	}))
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
	observe = vi.fn();
	unobserve = vi.fn();
	disconnect = vi.fn();
};
