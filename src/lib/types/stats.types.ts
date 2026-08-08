/**
 * 统计报表类型契约
 */
import type { CourseType } from './course.types';

export interface KpiOverview {
	totalApplications: number;
	pendingCount: number;
	approvedCount: number;
	completedCount: number;
	/** 完成率百分比 0-100 */
	completionRate: number;
}

export interface CourseRankingItem {
	courseId: number;
	courseName: string;
	enrolled: number;
	/** 课程类型，供前端按类型筛选排行 */
	type: CourseType;
}

export interface TypeDistributionItem {
	type: 'online' | 'offline' | 'hybrid';
	count: number;
}

export interface DepartmentDistributionItem {
	department: string;
	count: number;
}

export interface StatsOverview {
	kpi: KpiOverview;
	courseRanking: CourseRankingItem[];
	typeDistribution: TypeDistributionItem[];
	departmentDistribution: DepartmentDistributionItem[];
}
