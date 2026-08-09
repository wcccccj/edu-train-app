<script lang="ts">
	import { goto } from '$app/navigation';
	import type { ApiResponse, Page } from '$lib/types/common.types';
	import type { Course } from '$lib/types/course.types';
	import { resolve } from '$app/paths';

	interface Props {
		/** 容器透传的自定义 class */
		classes?: string;
		/** 跳转前的回调（用于关闭移动端搜索栏） */
		onNavigate?: () => void;
	}

	let { classes = '', onNavigate = () => {} }: Props = $props();

	let query = $state('');
	let results = $state<Course[]>([]);
	let isLoading = $state(false);
	let error = $state('');
	let isOpen = $state(false);
	let debounceTimer: ReturnType<typeof setTimeout> | undefined;
	let inputRef: HTMLInputElement;

	async function runSearch() {
		const keyword = query.trim();
		if (!keyword) {
			results = [];
			error = '';
			isOpen = false;
			return;
		}
		isLoading = true;
		error = '';
		try {
			const res = await fetch(`/api/courses?keyword=${encodeURIComponent(keyword)}&pageSize=5`);
			if (!res.ok) throw new Error('搜索请求失败');
			const data = (await res.json()) as ApiResponse<Page<Course>>;
			if (data.code !== 'OK' || !data.data) {
				throw new Error(data.message || '搜索失败');
			}
			results = data.data.list;
			isOpen = true;
		} catch (err) {
			error = err instanceof Error ? err.message : '搜索失败';
			results = [];
			isOpen = true;
		} finally {
			isLoading = false;
		}
	}

	function handleInput() {
		isOpen = true;
		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(runSearch, 300);
	}

	function submit(keyword = query) {
		const kw = keyword.trim();
		// 搜索事件启动后立即清空输入框与结果，防止残留搜索词干扰后续操作
		query = '';
		results = [];
		isOpen = false;
		onNavigate();
		// 动态 URL：resolve 处理后拼用户输入的查询参数，无法静态匹配路由 ID，故豁免该规则
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(`${resolve('/courses')}${kw ? `?keyword=${encodeURIComponent(kw)}` : ''}`);
	}

	function handleSearch() {
		submit();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			submit();
		} else if (event.key === 'Escape') {
			isOpen = false;
			inputRef?.blur();
		}
	}

	function handleBlur() {
		// 延迟关闭，保证点击下拉项时能触发 onclick
		setTimeout(() => (isOpen = false), 150);
	}
</script>

<div class={`relative ${classes}`}>
	<div class="group relative">
		<div
			class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-blue-600"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
				></path>
			</svg>
		</div>
		<input
			bind:this={inputRef}
			type="text"
			value={query}
			oninput={(e) => (query = e.currentTarget.value) && handleInput()}
			onkeydown={handleKeydown}
			onblur={handleBlur}
			onfocus={handleInput}
			class="w-full rounded-full border border-slate-300 bg-white py-2.5 pr-16 pl-10 text-slate-900 transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:outline-none sm:pr-28"
			placeholder="搜索课程"
			aria-label="搜索课程"
		/>
		<button
			type="button"
			onclick={handleSearch}
			disabled={isLoading}
			class="absolute inset-y-0 right-0 m-1 flex cursor-pointer items-center gap-1.5 rounded-full bg-blue-600 px-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-wait disabled:opacity-60 sm:px-4"
			aria-label="搜索"
		>
			{#if isLoading}
				<svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
					></circle>
					<path
						class="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
					></path>
				</svg>
			{:else}
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
					></path>
				</svg>
			{/if}
			<span class="hidden sm:inline">搜索</span>
		</button>
	</div>

	{#if isOpen}
		<div
			class="absolute top-full right-0 left-0 z-20 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
		>
			{#if error}
				<div class="flex items-center gap-2 px-4 py-3 text-sm text-red-600">
					<svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						></path>
					</svg>
					<span>{error}</span>
				</div>
			{:else if results.length > 0}
				<ul class="max-h-80 overflow-y-auto py-1">
					{#each results as course (course.id)}
						<li>
							<button
								type="button"
								onclick={() => submit(course.name)}
								class="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors hover:bg-slate-50"
							>
								<span class="flex min-w-0 items-center gap-2">
									<svg
										class="h-4 w-4 shrink-0 text-slate-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
										></path>
									</svg>
									<span class="truncate text-sm text-slate-700">{course.name}</span>
								</span>
								<span class="shrink-0 text-xs text-slate-400">{course.type}</span>
							</button>
						</li>
					{/each}
				</ul>
			{:else}
				<div class="px-4 py-4 text-sm text-slate-400">
					{query.trim() ? '未找到相关课程' : '输入关键词开始搜索'}
				</div>
			{/if}
		</div>
	{/if}
</div>
