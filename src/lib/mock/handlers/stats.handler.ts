import type { StatsOverview } from '$lib/types/stats.types';
import { applicationStore } from '../store/applications.store';
import { courseStore } from '../store/courses.store';
import { userStore } from '../store/users.store';

export function getStatsOverview(userId: string): StatsOverview {
	const allApps = applicationStore.listAll();

	// KPI (只统计当前用户的申请)
	const myApps = allApps.filter((a) => a.userId === userId);
	const totalApplications = myApps.length;
	let pendingCount = 0;
	let approvedCount = 0;
	let completedCount = 0;

	for (const app of myApps) {
		if (app.status === 'pending') pendingCount++;
		else if (app.status === 'approved') approvedCount++;
		else if (app.status === 'completed') completedCount++;
	}

	const completionRate =
		totalApplications === 0 ? 0 : Math.round((completedCount / totalApplications) * 100);

	const kpi = {
		totalApplications,
		pendingCount,
		approvedCount,
		completedCount,
		completionRate
	};

	// 报表数据 (统计全量数据，用于图表展示)
	// 1. 课程热度排行：返回全量并附带 type，供前端按类型筛选后再取 Top 5
	const allCourses = courseStore.listAll();
	const courseRanking = allCourses
		.map((c) => ({
			courseId: c.id,
			courseName: c.name,
			enrolled: c.enrolled,
			type: c.type
		}))
		.sort((a, b) => b.enrolled - a.enrolled);

	// 2. 培训类型分布
	const typeCount = { online: 0, offline: 0, hybrid: 0 };
	for (const c of allCourses) {
		typeCount[c.type] += c.enrolled;
	}
	const typeDistribution = [
		{ type: 'online' as const, count: typeCount.online },
		{ type: 'offline' as const, count: typeCount.offline },
		{ type: 'hybrid' as const, count: typeCount.hybrid }
	];

	// 3. 部门参与情况
	const deptCount: Record<string, number> = {};
	for (const app of allApps) {
		const user = userStore.findById(app.userId);
		if (user && user.department) {
			deptCount[user.department] = (deptCount[user.department] ?? 0) + 1;
		}
	}
	const departmentDistribution = Object.entries(deptCount)
		.map(([department, count]) => ({ department, count }))
		.sort((a, b) => b.count - a.count);

	return {
		kpi,
		courseRanking,
		typeDistribution,
		departmentDistribution
	};
}
