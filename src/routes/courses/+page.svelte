<script lang="ts">
	import { coursesStore, type Course, type Registration } from './store.svelte';
	import { toastStore } from './toast.svelte';
	import { authStore } from '$lib/stores/auth.store.svelte';
	import { enrollmentsStore } from '$lib/stores/enrollments.store.svelte';
	import { getUserId } from '$lib/types/user.types';
	import { userCache } from '$lib/utils/user-cache';
	import { formatStartTime } from '$lib/utils/enrollment-display';
	import dayjs from 'dayjs';
	import CourseCard from '$lib/components/CourseCard.svelte';
	import Notification from './components/Notification.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import EnrollmentFlow from '$lib/components/form/EnrollmentFlow.svelte';
	import {
		buildEnrollmentSchema,
		DEFAULT_LOCATIONS,
		type CourseLocationOption
	} from '$lib/components/form/enrollment-schema';
	import type { FormValues } from '$lib/components/form/form.types';
	import type { ApiResponse } from '$lib/types/common.types';
	import type { Course as ApiCourse } from '$lib/types/course.types';
	import Message from '$lib/components/message/Message.svelte';
	import { messageStore } from '$lib/components/message/message.store.svelte';
	import Modal from '$lib/components/Modal.svelte';

	let { data } = $props();

	const PAGE_SIZE = 8;
	let currentPage = $state(1);

	let totalPages = $derived(Math.max(1, Math.ceil(data.courses.length / PAGE_SIZE)));
	let paginatedCourses = $derived(
		data.courses.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
	);

	/** 用户切换时：按 user_id 重新加载该用户的报名记录，并缓存其课程列表查询结果 */
	$effect(() => {
		const userId = getUserId(authStore.currentUser);
		coursesStore.init(userId);
		enrollmentsStore.init(userId);
		if (userId) {
			userCache.set('course_list', userId, data.courses);
		}
	});

	let activeCourse = $state<Course | null>(null);
	/** 当前课程的实际培训地点（来自课程详情 /api/courses/[id]） */
	let courseLocations = $state<CourseLocationOption[]>([]);

	let schema = $derived(
		activeCourse
			? buildEnrollmentSchema({ ...activeCourse, locations: courseLocations }, undefined, false)
			: null
	);

	/** 拉取课程详情，用其实际地点构建报名表单的培训地点选项 */
	async function loadCourseLocations(course: Course) {
		courseLocations = [];
		if (course.type === 'online') return;
		try {
			const response = await fetch(`/api/courses/${course.id}`);
			if (!response.ok) return;
			const resData = (await response.json()) as ApiResponse<ApiCourse>;
			if (resData.code !== 'OK' || !resData.data) return;
			const locations = resData.data.locations ?? [];
			courseLocations = locations.map((l) => ({ label: l.name, value: l.name }));
		} catch {
			courseLocations = [];
		}
	}

	function handleRegister(course: Course) {
		if (!authStore.isAuthenticated) {
			messageStore.warning('您需要先登录账号才能继续报名流程');
			return;
		}
		activeCourse = course;
		loadCourseLocations(course);
	}

	function handleCancel(course: Course, reg: Registration) {
		coursesStore.removeRegistration(reg.id);
		if (typeof sessionStorage !== 'undefined') {
			sessionStorage.removeItem(`enrollment_${course.id}`);
		}
		const userId = authStore.currentUser?.id;
		if (userId) {
			enrollmentsStore.init(userId);
			enrollmentsStore.remove(reg.id);
		}
		toastStore.add('已取消报名', 'success');
	}

	function closeEnrollment() {
		activeCourse = null;
		courseLocations = [];
	}

	function getInitialData(): FormValues | undefined {
		// 新报名且已登录：用当前用户姓名预填
		if (authStore.isAuthenticated && authStore.currentUser?.name) {
			return { name: authStore.currentUser.name };
		}
		return undefined;
	}

	function handleEnrollmentComplete(data: FormValues) {
		if (!activeCourse) return;

		const userId = authStore.currentUser?.id;
		if (userId) enrollmentsStore.init(userId);

		// 培训地点选项：与报名表单下拉一致（实际地点优先，未取到时用兜底地点）
		// 持久化到报名记录，便于修改报名信息时重建相同的选择框
		const locationOptions =
			activeCourse.type === 'offline'
				? courseLocations.length
					? courseLocations
					: DEFAULT_LOCATIONS
				: undefined;

		// 特殊活动课程的额外填写字段：携带字段配置与用户填写值，便于报名信息修改时重建表单
		const extraFields = (activeCourse.extraFields ?? []).map((field) => ({
			name: field.name,
			label: field.label,
			type: field.type,
			required: field.required,
			options: field.options,
			value: data[field.name] ?? ''
		}));

		const newReg: Registration = {
			id: crypto.randomUUID(),
			courseId: activeCourse.id,
			name: data.name as string,
			phone: data.phone as string,
			address: data.address as string,
			location: data.location,
			timeSlot: data.timeSlot,
			extraFields
		};
		coursesStore.addRegistration(newReg);
		// 写入「我的报名」缓存，保证报名后 /enrollments 能读到
		if (userId) {
			enrollmentsStore.add({
				id: newReg.id,
				userId,
				courseId: activeCourse.id,
				courseName: activeCourse.title,
				type: activeCourse.type,
				applyDate: dayjs().format('YYYY-MM-DD'),
				status: 'pending',
				name: data.name as string,
				phone: data.phone as string,
				address: data.address as string,
				location: data.location,
				locationOptions,
				timeSlot: data.timeSlot,
				extraFields,
				startTime: activeCourse.startTime
			});
		}
		toastStore.add('报名成功！期待您的参与', 'success');
	}

	let formattedStartTime = $derived(activeCourse ? formatStartTime(activeCourse.startTime) : '');

	/** 地点容量是否有效正数（决定是否渲染「限 N 人」徽章） */
	function hasValidCapacity(loc: { capacity?: number }): boolean {
		return typeof loc.capacity === 'number' && Number.isFinite(loc.capacity) && loc.capacity > 0;
	}
</script>

<Notification />

<Message />

<div class="min-h-screen bg-slate-50 pb-20 font-sans text-slate-900">
	<main class="mx-auto max-w-5xl px-6 pt-10 pb-10">
		<div class="mb-10">
			<h1 class="mb-2 text-3xl font-bold tracking-tight">培训课程报名</h1>
			<p class="text-slate-500">选择您感兴趣的课程参与。</p>
		</div>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			{#each paginatedCourses as course (course.id)}
				<CourseCard
					{course}
					registration={coursesStore.getRegistrationForCourse(course.id)}
					registeredCount={(course.enrolled ?? 0) + coursesStore.getRegisteredCount(course.id)}
					onRegister={handleRegister}
					onCancel={handleCancel}
				/>
			{/each}
		</div>

		{#if totalPages > 1}
			<div class="mt-10 flex flex-col items-center gap-3 border-t border-slate-100 pt-6">
				<p class="text-sm text-slate-400">
					共 {data.courses.length} 门课程，第 {currentPage} / {totalPages} 页
				</p>
				<Pagination
					totalItems={data.courses.length}
					pageSize={PAGE_SIZE}
					bind:currentPage
					maxVisiblePages={7}
				/>
			</div>
		{/if}
	</main>
</div>

{#if activeCourse && schema}
	<Modal title="课程报名" onClose={closeEnrollment} maxWidth="2xl">
		{#snippet header()}
			{#if activeCourse}
				<p class="text-sm font-medium text-slate-600">{activeCourse.title}</p>
				<p class="mt-1 text-xs text-slate-500">{formattedStartTime}</p>
				{#if activeCourse.locations.length === 1}
					<p class="mt-1 text-xs text-slate-500">
						📍 {activeCourse.locations[0].name}
						{#if hasValidCapacity(activeCourse.locations[0])}
							<span class="ml-1 text-blue-700">（限 {activeCourse.locations[0].capacity} 人）</span>
						{/if}
					</p>
				{:else if activeCourse.locations.length > 1}
					<ul class="mt-2 space-y-0.5">
						{#each activeCourse.locations as loc (loc.name)}
							<li class="flex items-start gap-1 text-xs text-slate-500">
								<span>📍</span>
								<span class="flex-1 leading-4">{loc.name}</span>
								{#if hasValidCapacity(loc)}
									<span class="shrink-0 text-blue-700">（限 {loc.capacity} 人）</span>
								{/if}
							</li>
						{/each}
					</ul>
				{/if}
			{/if}
		{/snippet}

		<EnrollmentFlow
			{schema}
			sessionKey={`enrollment_${activeCourse.id}`}
			initialData={getInitialData()}
			onComplete={handleEnrollmentComplete}
			onCancel={closeEnrollment}
		/>
	</Modal>
{/if}
