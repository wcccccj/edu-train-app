<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	function handleRetry() {
		goto('/reports');
	}
</script>

<div class="min-h-screen bg-slate-50 p-6 md:p-10">
	<div class="mx-auto max-w-7xl">
		<div class="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-12 text-center">
			<div class="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
				<svg class="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			</div>
			<h2 class="mt-4 text-xl font-bold text-slate-900">统计数据加载失败</h2>
			<p class="mt-2 max-w-md text-sm text-slate-500">
				{$page.error?.message || '请检查网络连接或稍后重试'}
			</p>
			<button
				type="button"
				onclick={handleRetry}
				class="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
			>
				重新加载
			</button>
		</div>
	</div>
</div>
