import { render, cleanup, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi, afterEach } from 'vitest';
import ReportsPage from './+page.svelte';
import type { PageData } from './$types';

// 模拟 echarts：用 vi.hoisted 暴露 mockInstance / mockInit 供测试断言
const { mockInstance, mockInit } = vi.hoisted(() => {
	const instance = {
		setOption: vi.fn(),
		resize: vi.fn(),
		dispose: vi.fn()
	};
	return {
		mockInstance: instance,
		mockInit: vi.fn(() => instance)
	};
});

vi.mock('echarts', () => ({
	init: mockInit
}));

/** 从 setOption 调用历史中找出课程排行（横向柱状图，yAxis.data 为课程名）的最后一次 option */
function findLastRankingOption(): { yAxis?: { data?: unknown[] } } | undefined {
	const calls = mockInstance.setOption.mock.calls as Array<[{ yAxis?: { data?: unknown[] } }]>;
	for (let i = calls.length - 1; i >= 0; i--) {
		const data = calls[i][0]?.yAxis?.data;
		if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'string') {
			return calls[i][0];
		}
	}
	return undefined;
}

describe('Reports Page', () => {
	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	it('should render KPI and charts correctly', () => {
		const mockData: PageData = {
			stats: {
				kpi: {
					totalApplications: 100,
					pendingCount: 20,
					approvedCount: 50,
					completedCount: 30,
					completionRate: 30
				},
				courseRanking: [
					{ courseId: 1, courseName: 'Svelte 基础', enrolled: 50, type: 'online' as const }
				],
				typeDistribution: [
					{ type: 'online', count: 30 },
					{ type: 'offline', count: 20 }
				],
				departmentDistribution: [{ department: '研发部', count: 40 }]
			}
		};

		const { getByText } = render(ReportsPage, {
			props: {
				data: mockData
			}
		});

		// 验证 KPI 渲染
		expect(getByText('100')).toBeInTheDocument();
		expect(getByText('20')).toBeInTheDocument();
		expect(getByText('50')).toBeInTheDocument();
		expect(getByText('30')).toBeInTheDocument();
		expect(getByText('30%')).toBeInTheDocument();

		// 验证标题渲染
		expect(getByText('数据统计')).toBeInTheDocument();
		expect(getByText('热门课程排行 (Top 5)')).toBeInTheDocument();
		expect(getByText('培训类型分布')).toBeInTheDocument();
		expect(getByText('各部门参与人次')).toBeInTheDocument();
		expect(getByText('近30天报名趋势')).toBeInTheDocument();
		expect(getByText('过去12个月报名分布')).toBeInTheDocument();

		// 验证图表被初始化 5 次 (5个 Chart 组件)
		expect(mockInit).toHaveBeenCalledTimes(5);
	});

	it('should filter course ranking by type when clicking filter buttons', async () => {
		const mockData: PageData = {
			stats: {
				kpi: {
					totalApplications: 10,
					pendingCount: 2,
					approvedCount: 5,
					completedCount: 3,
					completionRate: 30
				},
				courseRanking: [
					{ courseId: 1, courseName: 'Svelte 基础', enrolled: 50, type: 'online' as const },
					{ courseId: 2, courseName: '安全实训', enrolled: 40, type: 'offline' as const },
					{ courseId: 3, courseName: '管理进阶', enrolled: 30, type: 'online' as const }
				],
				typeDistribution: [
					{ type: 'online', count: 80 },
					{ type: 'offline', count: 40 }
				],
				departmentDistribution: [{ department: '研发部', count: 5 }]
			}
		};

		const { getByText } = render(ReportsPage, {
			props: { data: mockData }
		});

		// 默认“全部”：课程排行应包含全部 3 个课程名
		let rankingOption = findLastRankingOption();
		expect(rankingOption?.yAxis?.data).toEqual(['Svelte 基础', '安全实训', '管理进阶']);

		// 点击“线上”筛选：仅展示 online 类型课程
		await fireEvent.click(getByText('线上'));
		rankingOption = findLastRankingOption();
		expect(rankingOption?.yAxis?.data).toEqual(['Svelte 基础', '管理进阶']);
	});

	it('should show empty state when filtered ranking is empty', async () => {
		const mockData: PageData = {
			stats: {
				kpi: {
					totalApplications: 0,
					pendingCount: 0,
					approvedCount: 0,
					completedCount: 0,
					completionRate: 0
				},
				courseRanking: [
					{ courseId: 1, courseName: '安全实训', enrolled: 40, type: 'offline' as const }
				],
				typeDistribution: [{ type: 'online', count: 0 }],
				departmentDistribution: []
			}
		};

		const { getByText } = render(ReportsPage, {
			props: { data: mockData }
		});

		// 点击“线上”：无 online 课程，应展示空状态
		await fireEvent.click(getByText('线上'));
		expect(getByText('该类型暂无课程数据')).toBeInTheDocument();

		// 部门分布为空也应展示空状态
		expect(getByText('暂无部门参与数据')).toBeInTheDocument();

		// 类型分布全为 0 应展示空状态
		expect(getByText('暂无类型分布数据')).toBeInTheDocument();
	});
});
