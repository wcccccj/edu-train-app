<script lang="ts">
	import CourseCard, {
		type CourseCardCourse,
		type CourseCardRegistration,
		type CourseCardProps,
		type CourseLocation
	} from '$lib/components/CourseCard.svelte';
	import DataTable from '$lib/components/table/DataTable.svelte';
	import type { Column } from '$lib/components/table/table.types';

	/** 组件 Props API 表数据 */
	interface ApiRow {
		name: string;
		type: string;
		desc: string;
		required: string;
	}

	const apiRows: ApiRow[] = [
		{
			name: 'course.locations',
			type: 'CourseLocation[]',
			desc: '培训地点数组；name 必选，capacity 可选（仅有效正数才渲染）',
			required: '是'
		},
		{ name: 'registeredCount', type: 'number', desc: '课程总报名人数（右上角容量进度）', required: '是' },
		{ name: 'onRegister', type: '(course) => void', desc: '点击「立即报名」回调', required: '是' },
		{ name: 'onCancel', type: '(course, reg) => void', desc: '点击「取消报名」回调', required: '是' }
	];

	const apiColumns: Column<ApiRow>[] = [
		{ key: 'name', title: '属性名' },
		{ key: 'type', title: '类型' },
		{ key: 'desc', title: '说明' },
		{ key: 'required', title: '必填' }
	];

	type ShowcaseScenario = {
		name: string;
		desc: string;
		course: CourseCardCourse;
		registration?: CourseCardRegistration;
		registeredCount: number;
	};

	const futureDate = (days: number) => new Date(Date.now() + days * 86400000).toISOString();
	const pastDate = (days: number) => new Date(Date.now() - days * 86400000).toISOString();

	const scenarios: ShowcaseScenario[] = [
		{
			name: '单地点 · 有人数限制',
			desc: '最常见场景：单个培训地点，明确配置人数上限',
			course: {
				id: 's1',
				title: 'Svelte 5 核心特性实战',
				description: '深入学习 Runes 响应式系统、Snippets 与 SvelteKit 最佳实践。',
				startTime: futureDate(5),
				locations: [{ name: '线上直播', capacity: 50 }],
				capacity: 50,
				type: 'online' as const
			},
			registeredCount: 12
		},
		{
			name: '单地点 · 无人数限制',
			desc: '地点不设容量（capacity 缺失）→ 不渲染「限 N 人」徽章',
			course: {
				id: 's2',
				title: 'AI 产品经理开放分享会',
				description: '面向全员的公益开放讲座，场地容量不限，仅需报名预留席位。',
				startTime: futureDate(7),
				locations: [{ name: '腾讯会议（开放报名后发送链接）' }],
				capacity: 999,
				type: 'online' as const
			},
			registeredCount: 88
		},
		{
			name: '多地点 · 全部配置人数限制',
			desc: '每个线下分场地独立配置人数上限，完整展示容量徽章',
			course: {
				id: 's3',
				title: 'Cloudflare Workers 边缘计算实战营',
				description: '覆盖 Workers / KV / D1 / R2 的真实项目演练，全国多地同步开班。',
				startTime: futureDate(10),
				locations: [
					{ name: '深圳培训中心 C 栋 201', capacity: 20 },
					{ name: '杭州培训中心 E 栋 405', capacity: 20 },
					{ name: '成都培训中心 F 栋 308', capacity: 25 }
				],
				capacity: 65,
				type: 'offline' as const
			},
			registeredCount: 38
		},
		{
			name: '多地点 · 混合（有限制 + 无限制）',
			desc: '部分地点设容量、部分不设 → 仅配置了容量的地点显示徽章',
			course: {
				id: 's4',
				title: '全栈 TDD 敏捷开发实战',
				description: '从测试用例出发，使用 Vitest 和 Playwright 构建健壮的 Web 应用。',
				startTime: futureDate(3),
				locations: [
					{ name: '上海培训中心 B 栋 102', capacity: 25 },
					{ name: '线上同步直播（无名额限制）' }
				],
				capacity: 40,
				type: 'offline' as const
			},
			registeredCount: 15
		},
		{
			name: '多地点 · 全部无人数限制',
			desc: '所有地点均不配置 capacity → 全部地点不显示人数限制信息',
			course: {
				id: 's5',
				title: '开源社区贡献者黑客松',
				description:
					'面向 Svelte、Vite、Tailwind 等项目的开源贡献者冲刺活动，多城联动线下观赛派对，容量协调安排。',
				startTime: futureDate(14),
				locations: [
					{ name: '北京 · 中关村创业大街 1 号' },
					{ name: '上海 · 徐汇漕河泾开发区创新中心' },
					{ name: '广州 · 天河珠江新城国际金融中心' },
					{ name: '线上 · Discord 语音频道（报名后邀请）' }
				],
				capacity: 500,
				type: 'offline' as const
			},
			registeredCount: 156
		},
		{
			name: '多地点 · 容量边界值（0/null/NaN 不展示）',
			desc: '容量条件渲染严格性验证：0、负数、NaN、null 均视为未设置',
			course: {
				id: 's6',
				title: '数据质量校验 · 条件渲染边界验证课程',
				description: '用于严格校验 hasValidCapacity 守卫函数在各种非法 capacity 输入下的行为。',
				startTime: futureDate(20),
				locations: [
					{ name: 'capacity = 0（不展示）', capacity: 0 as number },
					{ name: 'capacity = -10（不展示）', capacity: -10 as number },
					{ name: 'capacity = NaN（不展示）', capacity: NaN as number },
					{ name: 'capacity 正常正数（应展示）', capacity: 42 }
				],
				capacity: 42,
				type: 'offline' as const
			},
			registeredCount: 5
		}
	];

	function handleRegister(course: CourseCardCourse) {
		scenarioLog = `触发【立即报名】：${course.title}`;
	}

	function handleCancel(course: CourseCardCourse, reg: CourseCardRegistration) {
		scenarioLog = `触发【取消报名】：${course.title} / 学员：${reg.name}`;
	}

	let scenarioLog = $state('尚未触发任何交互事件，点击卡片按钮查看回调。');
</script>

<div class="mx-auto max-w-6xl px-6 py-10">
	<header class="mb-10">
		<h1 class="mb-2 text-3xl font-bold tracking-tight text-slate-900">
			培训地点展示 · 全场景验证矩阵
		</h1>
		<p class="leading-relaxed text-slate-500">
			覆盖 <strong class="text-slate-700">6 × 3 = 18</strong> 个关键组合： 单地点 / 多地点 × 有容量
			/ 无容量 / 容量边界值 × 有注册 / 已结束。 仅当某一地点配置了
			<code class="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-sm text-blue-700"
				>capacity</code
			> 为有效正数时，才展示「限 N 人」徽章。
		</p>
	</header>

	<div class="mb-10 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
		<strong class="font-semibold">交互日志：</strong>
		{scenarioLog}
	</div>

	<section class="mb-16">
		<h2 class="mb-6 flex items-center gap-2 text-xl font-bold text-slate-900">
			<span class="inline-block h-6 w-1 rounded bg-blue-600"></span>
			培训地点展示场景矩阵
		</h2>
		<div class="grid grid-cols-1 gap-8 md:grid-cols-2">
			{#each scenarios as sc (sc.course.id)}
				<article class="rounded-xl border border-slate-200 bg-white p-4">
					<header class="mb-4 border-l-4 border-blue-500 pl-3">
						<div class="text-sm font-semibold text-slate-800">{sc.name}</div>
						<div class="text-xs leading-snug text-slate-500">{sc.desc}</div>
					</header>
					<CourseCard
						course={sc.course}
						registration={sc.registration}
						registeredCount={sc.registeredCount}
						onRegister={handleRegister}
						onCancel={handleCancel}
					/>
					{#if sc.course.locations.length > 0}
						<footer class="mt-4 border-t border-dashed border-slate-200 pt-3">
							<div class="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
								Location Capacity 渲染断言
							</div>
							<ul class="mt-2 space-y-1 text-xs">
								{#each sc.course.locations as loc (loc.name)}
									<li class="flex items-center justify-between gap-2">
										<span class="truncate text-slate-600">{loc.name}</span>
										<span
											class={typeof loc.capacity === 'number' &&
											Number.isFinite(loc.capacity) &&
											loc.capacity > 0
												? 'font-mono text-green-700'
												: 'font-mono text-slate-400 line-through'}
										>
											{typeof loc.capacity === 'number' &&
											Number.isFinite(loc.capacity) &&
											loc.capacity > 0
												? `✓ 显示限 ${loc.capacity} 人`
												: `✗ 不展示 (capacity=${String(
														(loc as CourseLocation).capacity ?? 'undefined'
													)})`}
										</span>
									</li>
								{/each}
							</ul>
						</footer>
					{/if}
				</article>
			{/each}
		</div>
	</section>

	<hr class="mb-8 border-slate-200" />

	<h2 class="mb-4 text-xl font-bold text-slate-900">组件 Props API</h2>
	{#snippet apiName(row: ApiRow)}
		<code class="font-mono text-blue-600">{row.name}</code>
	{/snippet}
	{#snippet apiType(row: ApiRow)}
		<code class="font-mono text-slate-600">{row.type}</code>
	{/snippet}
	<DataTable
		data={apiRows}
		columns={apiColumns}
		rowKey="name"
		snippets={{ name: apiName, type: apiType }}
	/>

	<div class="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
		<p class="mb-2 font-semibold text-slate-800">导出类型：</p>
		<ul class="list-disc space-y-1 pl-5">
			<li>
				<code class="font-mono text-blue-600">CourseLocation</code> — 培训地点 &#123; name, capacity?
				&#125;
			</li>
			<li>
				<code class="font-mono text-blue-600">CourseCardCourse</code> — 课程（locations 数组替代 location）
			</li>
			<li><code class="font-mono text-blue-600">CourseCardRegistration</code> — 报名记录结构</li>
			<li><code class="font-mono text-blue-600">CourseCardProps</code> — 组件完整 Props 接口</li>
		</ul>
	</div>
</div>
