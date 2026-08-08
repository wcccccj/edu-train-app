/**
 * 统计报表类型契约
 */

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
