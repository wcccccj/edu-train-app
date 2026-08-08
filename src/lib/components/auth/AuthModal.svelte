<script lang="ts">
	import { authStore } from '$lib/stores/auth.store.svelte';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import type { User } from '$lib/types/user.types';

	let errorMsg = $state('');
	let isLoading = $state(false);

	let mockUsers = $state<User[]>([]);
	let selectedUser = $state<User | null>(null);

	onMount(async () => {
		try {
			const res = await fetch('/api/users');
			if (res.ok) {
				const data = await res.json();
				// Just take the first 3 users for demo purposes
				mockUsers = data.data.slice(0, 3);
			}
		} catch (e) {
			errorMsg = '无法获取用户列表';
		}
	});

	async function handleLogin() {
		if (!selectedUser) return;

		isLoading = true;
		errorMsg = '';

		try {
			const res = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userId: selectedUser.id })
			});

			const data = await res.json();

			if (!res.ok) {
				errorMsg = data.message || '登录失败';
			} else {
				authStore.login(data.data.user, data.data.token, true); // default remember me
				authStore.closeModal();
			}
		} catch (err) {
			errorMsg = '网络错误，请稍后再试';
		} finally {
			isLoading = false;
		}
	}

	function getInitial(name: string) {
		return name.charAt(0).toUpperCase();
	}

	function selectUser(user: User) {
		selectedUser = user;
	}

	function switchAccount() {
		selectedUser = null;
		errorMsg = '';
	}
</script>

{#if authStore.isAuthModalOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm sm:p-6"
		transition:fade={{ duration: 150 }}
	>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="absolute inset-0" onclick={() => authStore.closeModal()}></div>

		<div
			class="relative w-full max-w-[460px] overflow-hidden rounded-2xl bg-white shadow-xl"
			transition:fade={{ y: 20, duration: 200 }}
		>
			<!-- Close Button -->
			<button
				class="absolute top-4 right-4 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
				onclick={() => authStore.closeModal()}
				aria-label="关闭"
			>
				<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>

			<div class="px-8 pt-12 pb-8">
				<!-- Header -->
				<div class="mb-8 text-center">
					<div
						class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"
					>
						<svg class="h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
							<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
						</svg>
					</div>
					<h2 class="text-2xl font-bold tracking-tight text-slate-900">TAS 培训系统</h2>
					<p class="mt-3 text-sm text-slate-500">
						高效管理您的培训计划与学习进度，点击账号一键登录。
					</p>
				</div>

				<!-- Error Message -->
				{#if errorMsg}
					<div class="mb-6 rounded-lg bg-red-50 p-3 text-sm text-red-600">
						{errorMsg}
					</div>
				{/if}

				<div class="mb-6">
					{#if !selectedUser}
						<!-- User Selection List -->
						<div class="space-y-3">
							{#each mockUsers as user (user.id)}
								<!-- svelte-ignore a11y_click_events_have_key_events -->
								<!-- svelte-ignore a11y_interactive_supports_focus -->
								<div
									class="group flex cursor-pointer items-center gap-4 rounded-xl border border-slate-200 p-4 transition-all hover:border-blue-300 hover:bg-blue-50/50"
									onclick={() => selectUser(user)}
									role="button"
								>
									<div
										class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white shadow-sm"
									>
										{getInitial(user.name)}
									</div>
									<div class="min-w-0 flex-1">
										<div
											class="truncate text-base font-semibold text-slate-900 group-hover:text-blue-700"
										>
											{user.name}
										</div>
										<div class="truncate text-sm text-slate-500">{user.email || user.phone}</div>
									</div>
									<div class="text-slate-400 group-hover:text-blue-600">
										<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M9 5l7 7-7 7"
											/>
										</svg>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<!-- Selected User Card -->
						<div class="flex flex-col items-center">
							<div
								class="flex w-full items-center justify-between rounded-xl border border-slate-200 p-4 shadow-sm"
							>
								<div class="flex min-w-0 items-center gap-4">
									<div
										class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white"
									>
										{getInitial(selectedUser.name)}
									</div>
									<div class="min-w-0">
										<div class="truncate text-base font-semibold text-slate-900">
											{selectedUser.name}
										</div>
										<div class="truncate text-sm text-slate-500">
											{selectedUser.email || selectedUser.phone}
										</div>
									</div>
								</div>
								<button
									class="shrink-0 text-sm font-medium text-blue-600 hover:text-blue-800"
									onclick={switchAccount}
								>
									切换账号
								</button>
							</div>

							<button
								onclick={handleLogin}
								disabled={isLoading}
								class="mt-8 w-full max-w-[200px] rounded-full bg-blue-600 px-8 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow disabled:cursor-not-allowed disabled:bg-blue-400"
							>
								{isLoading ? '登录中...' : '继续'}
							</button>
						</div>
					{/if}
				</div>

				<!-- Footer text -->
				<div class="mt-8 text-center text-xs leading-relaxed text-slate-500">
					选择继续操作，即表示您同意与课程中的其他人分享您的联系信息。TAS
					系统提供培训排期、报名和学习记录管理服务。<br />
					详细了解 <a href="#privacy" class="text-blue-600 hover:underline">信息共享</a> 和
					<a href="#terms" class="text-blue-600 hover:underline">TAS 服务条款</a>。
				</div>
			</div>
		</div>
	</div>
{/if}
