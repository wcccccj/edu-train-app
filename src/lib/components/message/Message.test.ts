import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Message from './Message.svelte';
import { messageStore } from './message.store.svelte';

describe('messageStore', () => {
	beforeEach(() => {
		vi.useRealTimers();
		messageStore.clear();
	});

	afterEach(() => {
		vi.clearAllTimers();
	});

	describe('show', () => {
		it('adds a message with default type info, title and duration', () => {
			const id = messageStore.show({ content: 'hello' });
			expect(id).toBeTruthy();
			expect(messageStore.messages).toHaveLength(1);
			const msg = messageStore.messages[0];
			expect(msg.type).toBe('info');
			expect(msg.title).toBe('信息');
			expect(msg.content).toBe('hello');
			expect(msg.duration).toBe(3000);
		});

		it('accepts custom type, title, content and duration', () => {
			messageStore.show({ type: 'success', title: '自定义标题', content: '内容', duration: 5000 });
			const msg = messageStore.messages[0];
			expect(msg.type).toBe('success');
			expect(msg.title).toBe('自定义标题');
			expect(msg.content).toBe('内容');
			expect(msg.duration).toBe(5000);
		});

		it('does not auto close when duration is 0', () => {
			vi.useFakeTimers();
			messageStore.show({ content: 'persist', duration: 0 });
			vi.advanceTimersByTime(10000);
			expect(messageStore.messages).toHaveLength(1);
		});

		it('auto closes after the configured duration', () => {
			vi.useFakeTimers();
			messageStore.show({ content: 'temp', duration: 1000 });
			expect(messageStore.messages).toHaveLength(1);
			vi.advanceTimersByTime(1000);
			expect(messageStore.messages).toHaveLength(0);
		});
	});

	describe('close', () => {
		it('removes the message and calls onClose', () => {
			const onClose = vi.fn();
			const id = messageStore.show({ content: 'x', onClose });
			messageStore.close(id);
			expect(messageStore.messages).toHaveLength(0);
			expect(onClose).toHaveBeenCalledTimes(1);
		});

		it('does nothing for an unknown id and does not call onClose', () => {
			const onClose = vi.fn();
			messageStore.show({ content: 'x', onClose });
			messageStore.close('nope');
			expect(messageStore.messages).toHaveLength(1);
			expect(onClose).not.toHaveBeenCalled();
		});
	});

	describe('helpers', () => {
		it('success/error/warning/info set the correct type', () => {
			messageStore.success('s');
			messageStore.error('e');
			messageStore.warning('w');
			messageStore.info('i');
			expect(messageStore.messages.map((m) => m.type)).toEqual([
				'success',
				'error',
				'warning',
				'info'
			]);
		});

		it('helpers forward extra options such as duration', () => {
			vi.useFakeTimers();
			messageStore.success('s', { duration: 0 });
			expect(messageStore.messages[0].duration).toBe(0);
		});
	});

	describe('clear', () => {
		it('removes all messages', () => {
			messageStore.show({ content: 'a' });
			messageStore.show({ content: 'b' });
			messageStore.clear();
			expect(messageStore.messages).toHaveLength(0);
		});
	});
});

describe('Message component', () => {
	beforeEach(() => {
		messageStore.clear();
	});

	it('renders nothing when there are no messages', () => {
		render(Message);
		expect(screen.queryByRole('region', { name: '消息通知' })).toBeNull();
	});

	it('renders icon, title and content for a warning message', () => {
		messageStore.show({ type: 'warning', content: '您需要先登录账号才能继续报名流程' });
		render(Message);
		expect(screen.getByText('提示')).toBeTruthy();
		expect(screen.getByText('您需要先登录账号才能继续报名流程')).toBeTruthy();
		expect(screen.getByRole('status')).toBeTruthy();
	});

	it('renders multiple messages with different content configs', () => {
		messageStore.show({ type: 'success', content: '成功内容' });
		messageStore.show({ type: 'error', content: '错误内容' });
		messageStore.show({ type: 'info', content: '信息内容' });
		render(Message);

		expect(screen.getByText('成功内容')).toBeTruthy();
		expect(screen.getByText('错误内容')).toBeTruthy();
		expect(screen.getByText('信息内容')).toBeTruthy();
		expect(screen.getAllByRole('alert')).toHaveLength(1);
		expect(screen.getAllByRole('status')).toHaveLength(2);
	});

	it('uses role alert for error type', () => {
		messageStore.show({ type: 'error', content: 'err' });
		render(Message);
		expect(screen.getByRole('alert')).toBeTruthy();
	});

	it('closes a message when its close button is clicked', async () => {
		messageStore.show({ content: '可关闭' });
		render(Message);
		expect(screen.getByText('可关闭')).toBeTruthy();

		const closeBtn = screen.getAllByRole('button', { name: '关闭消息' })[0];
		await closeBtn.click();
		expect(screen.queryByText('可关闭')).toBeNull();
	});
});