<script lang="ts">
	/**
	 * 统计报表加载态骨架屏
	 * 在客户端导航至 /reports 期间由 +layout.svelte 根据 navigating 状态渲染
	 */
</script>

<div class="min-h-screen bg-slate-50 p-6 md:p-10">
	<div class="mx-auto max-w-7xl animate-pulse">
		<header class="mb-8">
			<div class="h-8 w-40 rounded bg-slate-200"></div>
			<div class="mt-3 h-4 w-72 rounded bg-slate-200"></div>
		</header>

		<!-- KPI 骨架 -->
		<section class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
			{#each Array(5) as _}
				<div class="rounded-xl border border-slate-200 bg-white p-6">
					<div class="h-4 w-20 rounded bg-slate-200"></div>
					<div class="mt-3 h-8 w-16 rounded bg-slate-200"></div>
				</div>
			{/each}
		</section>

		<!-- 图表骨架 -->
		<section class="grid grid-cols-1 gap-8 lg:grid-cols-2">
			<div class="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-2">
				<div class="mb-4 h-5 w-48 rounded bg-slate-200"></div>
				<div class="h-[400px] w-full rounded bg-slate-100"></div>
			</div>
			<div class="rounded-xl border border-slate-200 bg-white p-6">
				<div class="mb-4 h-5 w-40 rounded bg-slate-200"></div>
				<div class="h-[350px] w-full rounded bg-slate-100"></div>
			</div>
			<div class="rounded-xl border border-slate-200 bg-white p-6">
				<div class="mb-4 h-5 w-40 rounded bg-slate-200"></div>
				<div class="h-[350px] w-full rounded bg-slate-100"></div>
			</div>
		</section>
	</div>
</div>
