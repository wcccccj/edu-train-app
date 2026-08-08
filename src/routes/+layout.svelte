<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve */
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { authStore } from '$lib/stores/auth.store.svelte';
	import { browser } from '$app/environment';
	import { page, navigating } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import AuthModal from '$lib/components/auth/AuthModal.svelte';
	import Header from '$lib/components/Header.svelte';
	import ReportsSkeleton from './reports/Skeleton.svelte';

	let { children } = $props();

	// 客户端导航至 /reports 期间展示骨架屏
	let isLoadingReports = $derived(
		browser && $navigating != null && $navigating.to?.route.id === '/reports'
	);

	onMount(() => {
		authStore.init();
	});

	$effect(() => {
		if (browser && authStore.initialized) {
			const protectedRoutes = ['/enrollments', '/reports'];
			const isProtected = protectedRoutes.some((r) => $page.url.pathname.startsWith(r));
			if (isProtected && !authStore.isAuthenticated) {
				goto('/courses');
				authStore.openModal();
			}
		}
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{#if authStore.initialized || !browser}
	<Header />
	{#if isLoadingReports}
		<ReportsSkeleton />
	{:else}
		{@render children()}
	{/if}
{/if}

<AuthModal />
