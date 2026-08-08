<script lang="ts">
	import { buildEnrollmentSchema } from '$lib/components/form/enrollment-schema';
	import EnrollmentFlow from '$lib/components/form/EnrollmentFlow.svelte';
	import dayjs from 'dayjs';

	let course = $state({
		id: 'course-offline-1',
		type: 'offline' as const,
		startTime: dayjs().add(2, 'day').toISOString(), // more than 24h, not locked
		title: '高级Svelte开发实战 (线下班)'
	});

	let schema = $derived(buildEnrollmentSchema(course));
	let result = $state<Record<string, any> | null>(null);

	function toggleLock() {
		// Toggle between >24h and <24h
		const isLocked = dayjs(course.startTime).diff(dayjs(), 'hour') < 24;
		if (isLocked) {
			course.startTime = dayjs().add(2, 'day').toISOString();
		} else {
			course.startTime = dayjs().add(12, 'hour').toISOString();
		}
	}

	function handleComplete(data: Record<string, any>) {
		result = data;
		alert('报名成功！\n' + JSON.stringify(data, null, 2));
	}
</script>

<div class="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
	<div class="mx-auto max-w-xl">
		<div class="mb-8 text-center">
			<h2 class="text-3xl font-bold tracking-tight text-slate-900">课程报名</h2>
			<p class="mt-2 text-sm text-slate-600">{course.title}</p>

			<button
				onclick={toggleLock}
				class="mt-4 border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
			>
				当前状态: {dayjs(course.startTime).diff(dayjs(), 'hour') < 24
					? '已锁定修改 (<24h)'
					: '未锁定 (>24h)'} (点击切换)
			</button>
		</div>

		<div class="border border-slate-200 bg-white p-6 transition-all">
			{#if result}
				<div class="py-8 text-center">
					<div
						class="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100"
					>
						<svg
							class="h-8 w-8 text-green-600"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M5 13l4 4L19 7"
							/>
						</svg>
					</div>
					<h3 class="mb-2 text-xl font-medium text-slate-900">报名成功</h3>
					<p class="mb-6 text-slate-500">您已成功报名该课程</p>
					<button
						onclick={() => (result = null)}
						class="bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
					>
						返回重新报名
					</button>
				</div>
			{:else}
				<!-- sessionKey ensures state is scoped to this specific course enrollment -->
				<EnrollmentFlow
					{schema}
					sessionKey={`enrollment_${course.id}`}
					onComplete={handleComplete}
				/>
			{/if}
		</div>
	</div>
</div>
