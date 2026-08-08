<script lang="ts">
	import { authStore } from '$lib/stores/auth.store.svelte';
	import { enrollmentsStore } from '$lib/stores/enrollments.store.svelte';
	import { coursesStore } from '../../routes/courses/store.svelte';
	import { userCache } from '$lib/utils/user-cache';
	import { messageStore } from '$lib/components/message/message.store.svelte';
	import { page } from '$app/stores';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import CourseSearch from './CourseSearch.svelte';

	let isMobileMenuOpen = $state(false);
	let isMobileSearchOpen = $state(false);
	let isUserMenuOpen = $state(false);
	let userMenuContainer = $state<HTMLElement | null>(null);
	/** 关闭菜单的延迟计时器，用于鼠标在用户名与菜单间移动时的「悬停意图」缓冲 */
	let userMenuCloseTimer: ReturnType<typeof setTimeout> | undefined;

	function handleLogout() {
		authStore.logout();
		isMobileMenuOpen = false;
		isUserMenuOpen = false;
	}

	function goToLogin() {
		authStore.openModal();
		isMobileMenuOpen = false;
	}

	function toggleMobileMenu() {
		isMobileMenuOpen = !isMobileMenuOpen;
	}

	/** 清空当前用户的全部缓存（报名信息 + 课程报名状态 + 学习进度等） */
	function handleClearCache() {
		const userId = authStore.currentUser?.id ?? null;
		if (userId) {
			// 重置内存态，保证当前页面立即反映清空结果
			coursesStore.init(userId);
			coursesStore.clear();
			enrollmentsStore.init(userId);
			enrollmentsStore.clear();
			// 兜底：移除该用户所有作用域的持久化缓存键
			userCache.clearUser(userId);
		}
		messageStore.success('已清空缓存数据');
		isUserMenuOpen = false;
	}

	/** 鼠标移入用户名区域：取消关闭计时并打开菜单 */
	function openUserMenu() {
		if (userMenuCloseTimer) clearTimeout(userMenuCloseTimer);
		isUserMenuOpen = true;
	}

	/** 鼠标移出用户名区域：延迟关闭，给鼠标留出移入菜单的时间 */
	function scheduleCloseUserMenu() {
		if (userMenuCloseTimer) clearTimeout(userMenuCloseTimer);
		userMenuCloseTimer = setTimeout(() => {
			isUserMenuOpen = false;
		}, 150);
	}

	onMount(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				isUserMenuOpen &&
				userMenuContainer &&
				!userMenuContainer.contains(event.target as Node)
			) {
				isUserMenuOpen = false;
			}
		}
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	});
</script>

<header class="sticky top-0 z-30 border-b border-slate-200 bg-slate-50">
	<div class="mx-auto flex h-16 max-w-[1600px] items-center gap-4 px-6 text-sm">
		<!-- Logo -->
		<a href={resolve('/courses')} class="flex shrink-0 cursor-pointer items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors">
			<svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
				<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
			</svg>
			<span class="text-xl font-bold tracking-tight">TAS</span>
		</a>

		<!-- Desktop Navigation Links -->
		<nav class="hidden md:flex items-center gap-6 ml-4">
			<a 
				href={resolve('/courses')} 
				class="text-slate-600 hover:text-blue-600 transition-colors font-medium {$page.url.pathname.startsWith('/courses') ? 'text-blue-600' : ''}"
			>
				课程列表
			</a>
			{#if authStore.isAuthenticated}
				<a 
					href={resolve('/enrollments')} 
					class="text-slate-600 hover:text-blue-600 transition-colors font-medium {$page.url.pathname.startsWith('/enrollments') ? 'text-blue-600' : ''}"
				>
					报名信息
				</a>
				<a 
					href={resolve('/reports')} 
					class="text-slate-600 hover:text-blue-600 transition-colors font-medium {$page.url.pathname.startsWith('/reports') ? 'text-blue-600' : ''}"
				>
					统计报表
				</a>
			{/if}
		</nav>

		<!-- Search Bar (Desktop) -->
		<div class="mx-4 hidden max-w-3xl flex-1 sm:block">
			<CourseSearch classes="w-full" />
		</div>

		<!-- Icons & Buttons -->
		<div class="ml-auto flex shrink-0 items-center gap-3">
			<!-- Search Icon (Mobile Only) -->
			<button
				onclick={() => (isMobileSearchOpen = !isMobileSearchOpen)}
				class="p-2 text-slate-700 transition-colors hover:text-blue-600 sm:hidden"
				aria-label="搜索"
			>
				<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
				</svg>
			</button>

			<!-- Auth Buttons & Info (Desktop) -->
			<div class="hidden items-center gap-2 md:flex">
				{#if authStore.isAuthenticated}
					<div class="flex items-center gap-4">
						<!-- 用户名悬停下拉菜单 -->
						<div
							bind:this={userMenuContainer}
							class="relative"
							role="group"
							onmouseenter={openUserMenu}
							onmouseleave={scheduleCloseUserMenu}
						>
							<span
								class="flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-blue-600"
								role="button"
								aria-haspopup="true"
								aria-expanded={isUserMenuOpen}
							>
								{authStore.currentUser?.name}
								<svg
									class="h-3.5 w-3.5 transition-transform duration-200 {isUserMenuOpen ? 'rotate-180' : ''}"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M19 9l-7 7-7-7"
									></path>
								</svg>
							</span>

							{#if isUserMenuOpen}
								<div
									class="absolute right-0 top-full z-50 mt-1 min-w-36 origin-top-right overflow-hidden rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl"
									transition:fly={{ y: -6, duration: 150 }}
								>
									<button
										type="button"
										onclick={handleClearCache}
										class="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:bg-red-50 focus-visible:text-red-600"
									>
										<svg
											class="h-4 w-4"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
											></path>
										</svg>
										清空缓存
									</button>
								</div>
							{/if}
						</div>

						<button
							onclick={handleLogout}
							class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-all duration-150 ease-out hover:scale-[1.03] hover:border-slate-400 hover:bg-slate-100 hover:text-slate-900 hover:shadow-md active:scale-[0.97] active:bg-slate-200 active:shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
						>
							退出登录
						</button>
					</div>
				{:else}
					<button
						onclick={goToLogin}
						class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
					>
						登录
					</button>
				{/if}
			</div>

			<!-- Mobile Menu Button -->
			<button
				onclick={toggleMobileMenu}
				class="p-2 text-slate-700 transition-colors hover:text-blue-600 md:hidden"
				aria-label="菜单"
			>
				<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					{#if isMobileMenuOpen}
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					{:else}
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
					{/if}
				</svg>
			</button>
		</div>
	</div>

	<!-- Mobile Search Bar -->
	{#if isMobileSearchOpen}
		<div class="border-t border-slate-200 bg-white px-4 py-3 sm:hidden">
			<CourseSearch
				classes="w-full"
				onNavigate={() => (isMobileSearchOpen = false)}
			/>
		</div>
	{/if}

	<!-- Mobile Menu -->
	{#if isMobileMenuOpen}
		<div class="border-t border-slate-200 bg-white md:hidden">
			<div class="space-y-1 px-4 pb-3 pt-2">
				<a
					href={resolve('/courses')}
					onclick={() => isMobileMenuOpen = false}
					class="block rounded-md px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 {$page.url.pathname.startsWith('/courses') ? 'bg-blue-50 text-blue-600' : ''}"
				>
					课程列表
				</a>
				{#if authStore.isAuthenticated}
					<a
						href={resolve('/enrollments')}
						onclick={() => isMobileMenuOpen = false}
						class="block rounded-md px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 {$page.url.pathname.startsWith('/enrollments') ? 'bg-blue-50 text-blue-600' : ''}"
					>
						报名信息
					</a>
					<a
						href={resolve('/reports')}
						onclick={() => isMobileMenuOpen = false}
						class="block rounded-md px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 {$page.url.pathname.startsWith('/reports') ? 'bg-blue-50 text-blue-600' : ''}"
					>
						统计报表
					</a>
					<div class="my-2 border-t border-slate-200"></div>
					<div class="px-3 py-2 text-sm text-slate-500">
						已登录：{authStore.currentUser?.name}
					</div>
					<button
						onclick={handleLogout}
						class="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-slate-700 transition-all duration-150 ease-out hover:bg-slate-100 hover:pl-4 hover:text-slate-900 active:scale-[0.98] active:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
					>
						退出登录
					</button>
				{:else}
					<button
						onclick={goToLogin}
						class="mt-2 block w-full rounded-md bg-blue-600 px-3 py-2 text-center text-base font-medium text-white hover:bg-blue-700"
					>
						登录
					</button>
				{/if}
			</div>
		</div>
	{/if}
</header>
