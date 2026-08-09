<script lang="ts">
	import dayjs from 'dayjs';

	export interface CourseLocation {
		name: string;
		capacity?: number;
	}

	export interface CourseCardCourse {
		id: string;
		title: string;
		description: string;
		startTime: string;
		locations: CourseLocation[];
		capacity: number;
		type: 'online' | 'offline';
	}

	export interface CourseCardRegistration {
		id: string;
		courseId: string;
		name: string;
		phone: string;
		address: string;
		location?: string;
		timeSlot?: string;
	}

	export interface CourseCardProps {
		course: CourseCardCourse;
		registration?: CourseCardRegistration;
		registeredCount: number;
		onRegister: (course: CourseCardCourse) => void;
		onCancel: (course: CourseCardCourse, reg: CourseCardRegistration) => void;
	}

	let { course, registration, registeredCount, onRegister, onCancel }: CourseCardProps = $props();

	let isFull = $derived(registeredCount >= course.capacity);

	let timeUntilStart = $derived(dayjs(course.startTime).valueOf() - Date.now());
	let isPast = $derived(timeUntilStart < 0);

	/** 开始时间展示：非法字符串回退为空串，避免页面出现异常或错误格式 */
	let formattedDate = $derived.by(() => {
		const d = dayjs(course.startTime);
		if (!d.isValid()) return '';
		return d.format('M月D日 HH:mm');
	});

	function hasValidCapacity(loc: CourseLocation): boolean {
		return typeof loc.capacity === 'number' && Number.isFinite(loc.capacity) && loc.capacity > 0;
	}

	let isSingleLocation = $derived(course.locations.length === 1);
	let isMultiLocation = $derived(course.locations.length > 1);
</script>

<div
	class="group relative flex h-full flex-col border border-slate-200 bg-white p-5 transition-all hover:border-blue-300"
	class:border-l-4={!!registration}
	class:border-l-blue-500={!!registration}
	class:pl-4={!!registration}
>
	<div class="mb-3 flex shrink-0 items-start justify-between">
		<div class="min-w-0 flex-1">
			<h3 class="text-lg font-semibold text-slate-900 transition-colors group-hover:text-blue-600">
				{course.title}
			</h3>
			<div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
				<span class="flex shrink-0 items-center gap-1">
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
						></path></svg
					>
					{formattedDate}
				</span>

				{#if isSingleLocation}
					<span class="flex min-w-0 items-center gap-1">
						<svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"
							></path><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
							></path></svg
						>
						<span class="truncate">{course.locations[0].name}</span>
						{#if hasValidCapacity(course.locations[0])}
							<span
								class="ml-1 inline-flex items-center rounded bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-blue-100 ring-inset"
							>
								限 {course.locations[0].capacity} 人
							</span>
						{/if}
					</span>
				{/if}
			</div>

			{#if isMultiLocation}
				<div class="mt-3 space-y-1.5 rounded-md border border-slate-100 bg-slate-50/50 p-3">
					<div class="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
						<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"
							></path><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
							></path></svg
						>
						<span>培训地点（{course.locations.length}）</span>
					</div>
					<ul class="space-y-1">
						{#each course.locations as loc (loc.name + '_' + loc.capacity)}
							<li class="flex items-start gap-2 text-sm text-slate-600">
								<span class="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500"
								></span>
								<span class="min-w-0 flex-1 leading-5">{loc.name}</span>
								{#if hasValidCapacity(loc)}
									<span
										class="inline-flex shrink-0 items-center rounded bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-blue-100 ring-inset"
									>
										限 {loc.capacity} 人
									</span>
								{/if}
							</li>
						{/each}
					</ul>
				</div>
			{/if}
		</div>
		<div class="ml-4 shrink-0 text-right">
			<span class="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
				{registeredCount} / {course.capacity}
			</span>
		</div>
	</div>

	<p class="mb-5 line-clamp-2 min-h-0 flex-1 text-sm text-slate-600">
		{course.description}
	</p>

	<div class="mt-auto flex shrink-0 items-center justify-between border-t border-slate-100 pt-4">
		<div class="text-sm">
			{#if registration}
				<span class="flex items-center gap-1 font-medium text-blue-600">
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
						></path></svg
					>
					已报名
				</span>
			{:else if isPast}
				<span class="font-medium text-slate-400">已结束</span>
			{:else if isFull}
				<span class="font-medium text-red-500">名额已满</span>
			{:else}
				<span class="text-slate-500">开放报名中</span>
			{/if}
		</div>

		<div>
			{#if registration}
				{#if isPast}
					<button
						disabled
						class="cursor-not-allowed border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-400"
					>
						不可取消 (已结束)
					</button>
				{:else}
					<button
						onclick={() => onCancel(course, registration!)}
						class="border border-blue-200 bg-white px-4 py-2 text-sm text-blue-600 transition-colors hover:bg-blue-50"
					>
						取消报名
					</button>
				{/if}
			{:else}
				{#if !isPast && !isFull}
					<button
						onclick={() => onRegister(course)}
						class="bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
					>
						立即报名
					</button>
				{:else}
					<button
						disabled
						class="cursor-not-allowed border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-400"
					>
						无法报名
					</button>
				{/if}
			{/if}
		</div>
	</div>
</div>
