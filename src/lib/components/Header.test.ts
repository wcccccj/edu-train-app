import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import Header from './Header.svelte';
import { authStore } from '$lib/stores/auth.store.svelte';
import { messageStore } from '$lib/components/message/message.store.svelte';

vi.mock('$app/environment', () => ({ browser: true }));
vi.mock('$app/paths', () => ({ resolve: (path: string) => path }));
// Header 内嵌 CourseSearch，其引用 $app/navigation；必须一并 mock，否则会加载真实 Kit 客户端运行时
vi.mock('$app/navigation', () => ({ goto: vi.fn() }));
vi.mock('$app/stores', () => {
	const value = { url: new URL('http://localhost/courses') };
	const page = {
		subscribe(fn: (v: unknown) => void) {
			fn(value);
			return () => {};
		}
	};
	return { page };
});

const user = {
	id: 'u1',
	name: '张三',
	gender: 'male' as const,
	phone: '13800138000',
	email: 'zhangsan@example.com'
};

describe('Header 顶部导航组件', () => {
	beforeEach(() => {
		authStore.logout();
		authStore.isAuthModalOpen = false;
		messageStore.clear();
	});

	it('未登录时展示 Logo 与「登录」按钮，不展示报名信息/统计报表', () => {
		render(Header);
		expect(screen.getByText('TAS')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: '登录' })).toBeInTheDocument();
		expect(screen.queryByText('报名信息')).not.toBeInTheDocument();
		expect(screen.queryByText('统计报表')).not.toBeInTheDocument();
	});

	it('点击「登录」打开登录弹窗', async () => {
		render(Header);
		await fireEvent.click(screen.getByRole('button', { name: '登录' }));
		expect(authStore.isAuthModalOpen).toBe(true);
	});

	it('已登录时展示用户名、报名信息/统计报表入口与退出登录', () => {
		authStore.login(user, 'token');
		render(Header);
		expect(screen.getByText('张三')).toBeInTheDocument();
		expect(screen.getByText('报名信息')).toBeInTheDocument();
		expect(screen.getByText('统计报表')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: '退出登录' })).toBeInTheDocument();
	});

	it('点击「退出登录」登出账号', async () => {
		authStore.login(user, 'token');
		render(Header);
		await fireEvent.click(screen.getByRole('button', { name: '退出登录' }));
		expect(authStore.isAuthenticated).toBe(false);
	});

	it('点击「菜单」按钮展开移动端菜单', async () => {
		authStore.login(user, 'token');
		render(Header);
		await fireEvent.click(screen.getByRole('button', { name: '菜单' }));
		// 移动端菜单独有的「已登录：」标识
		expect(screen.getByText('已登录：张三')).toBeInTheDocument();
	});

	it('悬停用户名后点击「清空缓存」触发成功提示', async () => {
		authStore.login(user, 'token');
		render(Header);
		// 用户菜单的 mouseenter 监听在 role=group 的包裹容器上
		const group = screen.getByRole('group');
		await fireEvent.mouseEnter(group);
		await fireEvent.click(screen.getByText('清空缓存'));
		expect(messageStore.messages.length).toBeGreaterThan(0);
		expect(messageStore.messages[0].content).toBe('已清空缓存数据');
	});
});
