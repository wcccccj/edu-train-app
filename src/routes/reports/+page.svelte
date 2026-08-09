<script lang="ts">
	import { SvelteDate } from 'svelte/reactivity';
	import type { PageData } from './$types';
	import type { CourseType } from '$lib/types/course.types';
	import Chart from '$lib/components/Chart.svelte';
	import {
		getCourseRankingOption,
		getTypeDistributionOption,
		getDepartmentDistributionOption,
		getDailyTrendOption,
		getCalendarHeatmapOption
	} from '$lib/components/charts/chart-options';

	let { data }: { data: PageData } = $props();

	// 培训类型筛选（仅作用于课程热度排行）
	type FilterType = CourseType | 'all';
	let selectedType = $state<FilterType>('all');

	const TYPE_LABELS: Record<FilterType, string> = {
		all: '全部',
		online: '线上',
		offline: '线下',
		hybrid: '混合'
	};

	// KPI
	let kpi = $derived(data.stats.kpi);

	// 课程热度排行：前端按类型过滤后取 Top 5
	let filteredRanking = $derived(
		selectedType === 'all'
			? data.stats.courseRanking.slice(0, 5)
			: data.stats.courseRanking.filter((item) => item.type === selectedType).slice(0, 5)
	);

	let courseRankingOption = $derived(
		getCourseRankingOption(
			filteredRanking.map((item) => item.courseName),
			filteredRanking.map((item) => item.enrolled)
		)
	);

	let typeDistributionOption = $derived(
		getTypeDistributionOption(
			data.stats.typeDistribution.map((item) => ({
				name: item.type === 'online' ? '线上' : item.type === 'offline' ? '线下' : '混合',
				value: item.count
			}))
		)
	);

	let departmentDistributionOption = $derived(
		getDepartmentDistributionOption(
			data.stats.departmentDistribution.map((item) => item.department),
			data.stats.departmentDistribution.map((item) => item.count)
		)
	);

	// 双轴组合图：近30天报名趋势 (mock 数据)
	const DAILY_TREND_DAYS = 30;
	const dailyDates: string[] = [];
	const dailyCounts: number[] = [];
	const dailyGrowthRates: number[] = [];

	// 以当前日期为终点，向前生成近 30 天
	for (let i = DAILY_TREND_DAYS - 1; i >= 0; i--) {
		const d = new SvelteDate();
		d.setDate(d.getDate() - i);
		dailyDates.push(`${d.getMonth() + 1}/${d.getDate()}`);
	}
	// 使用带随机波动的 mock 报名人数（整体呈上升趋势，突出上升势头）
	let prev = 15;
	for (let i = 0; i < DAILY_TREND_DAYS; i++) {
		const count = Math.max(4, Math.round(prev + (Math.random() - 0.35) * 10));
		dailyCounts.push(count);
		const growth = i === 0 ? 0 : Math.round(((count - prev) / prev) * 100);
		dailyGrowthRates.push(growth);
		prev = count;
	}

	let dailyTrendOption = $derived(getDailyTrendOption(dailyDates, dailyCounts, dailyGrowthRates));

	// 日历热力图：过去12个月报名分布 (mock 数据)
	// 以今天为终点，向前滚动 12 个月
	const now = new Date();
	const heatmapStart = new Date(now.getFullYear(), now.getMonth() - 11, 1);
	const pad2 = (n: number) => String(n).padStart(2, '0');
	const rangeStart = `${heatmapStart.getFullYear()}-${pad2(heatmapStart.getMonth() + 1)}`;
	const rangeEnd = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}`;

	const heatmapData: [string, number][] = [];
	for (let d = new SvelteDate(heatmapStart); d <= now; d.setDate(d.getDate() + 1)) {
		const dateStr = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
		// 暑期(7-8月)与年末(12月)为报名爆发期，数值更高
		const month = d.getMonth() + 1;
		let base = 20;
		if (month === 7 || month === 8) base = 80;
		else if (month === 12) base = 70;
		else if (month >= 3 && month <= 6) base = 45;
		const value = Math.max(0, Math.min(100, Math.round(base + (Math.random() - 0.5) * 30)));
		heatmapData.push([dateStr, value]);
	}

	let calendarHeatmapOption = $derived(getCalendarHeatmapOption(heatmapData, rangeStart, rangeEnd));

	const filterOptions: FilterType[] = ['all', 'online', 'offline', 'hybrid'];
</script>

<div class="min-h-screen bg-slate-50 p-6 md:p-10">
	<div class="mx-auto max-w-7xl">
		<header class="mb-8">
			<h1 class="text-3xl font-bold text-slate-900">数据统计</h1>
			<p class="mt-2 text-slate-500">查看学员申请情况与整体培训数据概览</p>
		</header>

		<!-- KPI 概览区 -->
		<section class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
			<div class="rounded-xl border border-slate-200 bg-white p-6">
				<h3 class="text-sm font-medium text-slate-500">我的申请总数</h3>
				<p class="mt-2 text-3xl font-bold text-slate-900">{kpi.totalApplications}</p>
			</div>
			<div class="rounded-xl border border-slate-200 bg-white p-6">
				<h3 class="text-sm font-medium text-slate-500">待审批</h3>
				<p class="mt-2 text-3xl font-bold text-amber-500">{kpi.pendingCount}</p>
			</div>
			<div class="rounded-xl border border-slate-200 bg-white p-6">
				<h3 class="text-sm font-medium text-slate-500">已通过</h3>
				<p class="mt-2 text-3xl font-bold text-blue-600">{kpi.approvedCount}</p>
			</div>
			<div class="rounded-xl border border-slate-200 bg-white p-6">
				<h3 class="text-sm font-medium text-slate-500">已完成</h3>
				<p class="mt-2 text-3xl font-bold text-emerald-500">{kpi.completedCount}</p>
			</div>
			<div class="rounded-xl border border-slate-200 bg-white p-6">
				<h3 class="text-sm font-medium text-slate-500">完成率</h3>
				<p class="mt-2 text-3xl font-bold text-slate-900">{kpi.completionRate}%</p>
			</div>
		</section>

		<!-- 图表展示区 -->
		<section class="grid grid-cols-1 gap-8 lg:grid-cols-2">
			<!-- 课程热度排行 -->
			<div class="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-2">
				<div class="mb-4 flex flex-wrap items-center justify-between gap-3">
					<h3 class="text-lg font-bold text-slate-800">热门课程排行 (Top 5)</h3>
					<div
						class="flex items-center gap-1 rounded-lg bg-slate-100 p-1"
						role="group"
						aria-label="培训类型筛选"
					>
						{#each filterOptions as opt (opt)}
							<button
								type="button"
								onclick={() => (selectedType = opt)}
								class={`rounded-md px-3 py-1.5 text-sm font-medium transition focus:ring-2 focus:ring-blue-500 focus:outline-none ${
									selectedType === opt
										? 'bg-white text-blue-600 shadow-sm'
										: 'text-slate-500 hover:text-slate-700'
								}`}
							>
								{TYPE_LABELS[opt]}
							</button>
						{/each}
					</div>
				</div>
				{#if filteredRanking.length === 0}
					<div class="flex h-[400px] flex-col items-center justify-center text-slate-400">
						<svg
							class="h-12 w-12"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="1.5"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
							/>
						</svg>
						<p class="mt-2 text-sm">该类型暂无课程数据</p>
					</div>
				{:else}
					<div class="h-[400px]">
						<Chart options={courseRankingOption} />
					</div>
				{/if}
			</div>

			<!-- 培训类型分布 -->
			<div class="rounded-xl border border-slate-200 bg-white p-6">
				<h3 class="mb-4 text-lg font-bold text-slate-800">培训类型分布</h3>
				{#if data.stats.typeDistribution.every((item) => item.count === 0)}
					<div class="flex h-[350px] items-center justify-center text-sm text-slate-400">
						暂无类型分布数据
					</div>
				{:else}
					<div class="h-[350px]">
						<Chart options={typeDistributionOption} />
					</div>
				{/if}
			</div>

			<!-- 部门参与情况 -->
			<div class="rounded-xl border border-slate-200 bg-white p-6">
				<h3 class="mb-4 text-lg font-bold text-slate-800">各部门参与人次</h3>
				{#if data.stats.departmentDistribution.length === 0}
					<div class="flex h-[350px] items-center justify-center text-sm text-slate-400">
						暂无部门参与数据
					</div>
				{:else}
					<div class="h-[350px]">
						<Chart options={departmentDistributionOption} />
					</div>
				{/if}
			</div>

			<!-- 近30天报名趋势：双轴组合图 -->
			<div class="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-2">
				<div class="mb-2 flex flex-wrap items-center justify-between gap-2">
					<h3 class="text-lg font-bold text-slate-800">近30天报名趋势</h3>
					<span class="text-sm text-slate-400">柱状：每日报名人数 | 折线：日环比增长率</span>
				</div>
				<div class="h-[380px]">
					<Chart options={dailyTrendOption} />
				</div>
			</div>

			<!-- 过去12个月报名分布：日历热力图 -->
			<div class="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-2">
				<div class="mb-2 flex flex-wrap items-center justify-between gap-2">
					<h3 class="text-lg font-bold text-slate-800">过去12个月报名分布</h3>
					<span class="text-sm text-slate-400">颜色越深代表报名越集中</span>
				</div>
				<div class="h-[360px]">
					<Chart options={calendarHeatmapOption} />
				</div>
			</div>
		</section>
	</div>
</div>
