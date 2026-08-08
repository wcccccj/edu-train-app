import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EnrollmentStore } from './EnrollmentStore.svelte';
import type { FormValues } from './form.types';

describe('EnrollmentStore', () => {
	beforeEach(() => {
		sessionStorage.clear();
		localStorage.clear();
		vi.clearAllMocks();
	});

	it('should initialize with default values when no session storage exists', () => {
		const store = new EnrollmentStore('test-key');
		expect(store.data).toEqual({});
		expect(store.step).toBe('form');
	});

	it('should initialize with initialData if provided', () => {
		const store = new EnrollmentStore('test-key', { name: '张三' });
		expect(store.data).toEqual({ name: '张三' });
	});

	it('should restore data from sessionStorage', () => {
		sessionStorage.setItem(
			'test-key',
			JSON.stringify({
				data: { name: '李四' },
				step: 'preview'
			})
		);

		const store = new EnrollmentStore('test-key');
		expect(store.data).toEqual({ name: '李四' });
		expect(store.step).toBe('preview');
	});

	it('should update data and save to sessionStorage', () => {
		const store = new EnrollmentStore('test-key');
		store.updateData({ name: '王五', phone: '13800138000' });

		expect(store.data).toEqual({ name: '王五', phone: '13800138000' });
		const stored = JSON.parse(sessionStorage.getItem('test-key')!);
		expect(stored.data).toEqual({ name: '王五', phone: '13800138000' });
	});

	it('should merge data on update', () => {
		const store = new EnrollmentStore<FormValues>('test-key', { name: '赵六' });
		store.updateData({ phone: '13912345678' });

		expect(store.data).toEqual({ name: '赵六', phone: '13912345678' });
	});

	it('should update step and save to sessionStorage', () => {
		const store = new EnrollmentStore('test-key');
		store.setStep('preview');

		expect(store.step).toBe('preview');
		const stored = JSON.parse(sessionStorage.getItem('test-key')!);
		expect(stored.step).toBe('preview');
	});

	it('should clear data and remove from sessionStorage', () => {
		const store = new EnrollmentStore('test-key');
		store.updateData({ name: '测试' });
		store.clear();

		expect(store.data).toEqual({});
		expect(store.step).toBe('form');
		expect(sessionStorage.getItem('test-key')).toBeNull();
	});
});
