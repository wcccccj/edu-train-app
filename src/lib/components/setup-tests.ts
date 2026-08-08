import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Web Animations API
if (typeof Element !== 'undefined') {
	Element.prototype.animate = vi.fn().mockReturnValue({
		finished: Promise.resolve(),
		cancel: vi.fn(),
		play: vi.fn(),
		pause: vi.fn(),
		set onfinish(cb: () => void) {
			setTimeout(cb, 0);
		}
	});
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
