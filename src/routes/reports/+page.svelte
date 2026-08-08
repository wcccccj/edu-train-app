<script lang="ts">
	import type { PageData } from './$types';
	import type { CourseType } from '$lib/types/course.types';
	import Chart from '$lib/components/Chart.svelte';
	import {
		getCourseRankingOption,
		getTypeDistributionOption,
		getDepartmentDistributionOption
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
					<div class="flex items-center gap-1 rounded-lg bg-slate-100 p-1" role="group" aria-label="培训类型筛选">
						{#each filterOptions as opt}
							<button
								type="button"
								onclick={() => (selectedType = opt)}
								class={`rounded-md px-3 py-1.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
						<svg class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
							<path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
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
		</section>
	</div>
</div>
