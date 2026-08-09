import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import CourseSearch from './CourseSearch.svelte';
import { goto } from '$app/navigation';

vi.mock('$app/navigation', () => ({ goto: vi.fn() }));
vi.mock('$app/paths', () => ({ resolve: (path: string) => path }));

function okResponse(data: unknown): Promise<Response> {
	return Promise.resolve({
		ok: true,
		json: () => Promise.resolve(data)
	} as unknown as Response);
}

function errResponse(code: string, message: string): Promise<Response> {
	return Promise.resolve({
		ok: true,
		json: () => Promise.resolve({ code, message })
	} as unknown as Response);
}

const RESULT = { code: 'OK', data: { list: [{ id: 'c1', name: 'Svelte', type: 'online' }] } };

describe('CourseSearch 课程搜索组件', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.mocked(goto).mockClear();
		vi.mocked(goto).mockReset();
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	it('渲染带搜索语义的输入框与搜索按钮', () => {
		global.fetch = vi.fn();
		render(CourseSearch);
		expect(screen.getByRole('textbox', { name: '搜索课程' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: '搜索' })).toBeInTheDocument();
	});

	it('空关键词点击搜索时跳转 /courses 且不发起请求', async () => {
		global.fetch = vi.fn();
		render(CourseSearch);
		await fireEvent.click(screen.getByRole('button', { name: '搜索' }));
		expect(goto).toHaveBeenCalledWith('/courses');
		expect(global.fetch).not.toHaveBeenCalled();
	});

	it('输入关键词经过防抖后发起搜索并渲染结果', async () => {
		global.fetch = vi.fn().mockImplementation(() => okResponse(RESULT));
		render(CourseSearch);
		const input = screen.getByRole('textbox', { name: '搜索课程' });
		await fireEvent.input(input, { target: { value: 'Svel' } });
		await vi.advanceTimersByTimeAsync(300);

		expect(global.fetch).toHaveBeenCalledWith('/api/courses?keyword=Svel&pageSize=5');
		expect(screen.getByText('Svelte')).toBeInTheDocument();
		expect(screen.getByText('online')).toBeInTheDocument();
	});

	it('点击下拉结果项后按课程名跳转并携带关键词', async () => {
		global.fetch = vi.fn().mockImplementation(() => okResponse(RESULT));
		render(CourseSearch);
		const input = screen.getByRole('textbox', { name: '搜索课程' });
		await fireEvent.input(input, { target: { value: 'Svel' } });
		await vi.advanceTimersByTimeAsync(300);

		await fireEvent.click(screen.getByText('Svelte'));
		expect(goto).toHaveBeenCalledWith('/courses?keyword=Svelte');
	});

	it('搜索返回错误时展示错误信息', async () => {
		global.fetch = vi.fn().mockImplementation(() => errResponse('ERR', '搜索失败'));
		render(CourseSearch);
		const input = screen.getByRole('textbox', { name: '搜索课程' });
		await fireEvent.input(input, { target: { value: 'x' } });
		await vi.advanceTimersByTimeAsync(300);

		expect(screen.getByText('搜索失败')).toBeInTheDocument();
	});

	it('搜索无结果时展示「未找到相关课程」', async () => {
		global.fetch = vi.fn().mockImplementation(() => okResponse({ code: 'OK', data: { list: [] } }));
		render(CourseSearch);
		const input = screen.getByRole('textbox', { name: '搜索课程' });
		await fireEvent.input(input, { target: { value: 'zzz' } });
		await vi.advanceTimersByTimeAsync(300);

		expect(screen.getByText('未找到相关课程')).toBeInTheDocument();
	});

	it('按回车键提交当前关键词', async () => {
		global.fetch = vi.fn();
		render(CourseSearch);
		const input = screen.getByRole('textbox', { name: '搜索课程' });
		await fireEvent.input(input, { target: { value: 'Python' } });
		await fireEvent.keyDown(input, { key: 'Enter' });

		expect(goto).toHaveBeenCalledWith('/courses?keyword=Python');
	});

	it('搜索进行中时禁用按钮', async () => {
		let resolveFetch!: (value: Response) => void;
		global.fetch = vi.fn().mockReturnValue(new Promise<Response>((res) => (resolveFetch = res)));
		render(CourseSearch);
		const input = screen.getByRole('textbox', { name: '搜索课程' });
		await fireEvent.input(input, { target: { value: 'Svel' } });
		await vi.advanceTimersByTimeAsync(300);

		expect(screen.getByRole('button', { name: '搜索' })).toBeDisabled();
		resolveFetch(await okResponse(RESULT));
	});

	it('按 Escape 键关闭下拉结果', async () => {
		global.fetch = vi.fn().mockImplementation(() => okResponse(RESULT));
		render(CourseSearch);
		const input = screen.getByRole('textbox', { name: '搜索课程' });
		await fireEvent.input(input, { target: { value: 'Svel' } });
		await vi.advanceTimersByTimeAsync(300);
		expect(screen.getByText('Svelte')).toBeInTheDocument();

		await fireEvent.keyDown(input, { key: 'Escape' });
		expect(screen.queryByText('Svelte')).not.toBeInTheDocument();
	});
});
