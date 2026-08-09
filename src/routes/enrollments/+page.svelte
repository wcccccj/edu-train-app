<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { z } from 'zod';
	import { authStore } from '$lib/stores/auth.store.svelte';
	import {
		enrollmentsStore,
		type Enrollment,
		type EnrollmentType
	} from '$lib/stores/enrollments.store.svelte';
	import { maskPhone, resolveLocation, formatStartTime } from '$lib/utils/enrollment-display';
	import DynamicForm from '$lib/components/form/DynamicForm.svelte';
	import type {
		SectionedFormSchema,
		FormField,
		FormSection,
		FormValues
	} from '$lib/components/form/form.types';
	import Message from '$lib/components/message/Message.svelte';
	import { messageStore } from '$lib/components/message/message.store.svelte';
	import DataTable from '$lib/components/table/DataTable.svelte';
	import type { Column } from '$lib/components/table/table.types';
	import Modal from '$lib/components/Modal.svelte';

	type FilterType = 'all' | 'online' | 'offline';

	const TYPE_LABEL: Record<EnrollmentType, string> = {
		online: '线上',
		offline: '线下',
		hybrid: '混合'
	};

	/** 报名列表列配置：展示逻辑声明化，复杂单元格（状态/操作）走逐列插槽 */
	const enrollColumns: Column<Enrollment>[] = [
		{
			key: 'courseName',
			title: '课程名称',
			fallback: '—',
			cellClass: 'font-medium text-slate-900'
		},
		{ key: 'type', title: '培训类型', map: TYPE_LABEL },
		{ key: 'name', title: '报名人', fallback: '—', cellClass: 'text-slate-800' },
		{
			key: 'phone',
			title: '联系方式',
			formatter: (value) => maskPhone(value as string | undefined)
		},
		{
			key: 'location',
			title: '培训地点',
			formatter: (_value, row) => resolveLocation(row.type, row.location)
		},
		{
			key: 'startTime',
			title: '开始时间',
			formatter: (_value, row) => formatStartTime(row.startTime)
		},
		{ key: 'applyDate', title: '申请时间', fallback: '—' },
		{ key: 'status', title: '状态' },
		{ key: 'actions', title: '操作' }
	];

	const STATUS_LABEL: Record<Enrollment['status'], string> = {
		pending: '待审核',
		approved: '已通过',
		rejected: '已拒绝',
		completed: '已完成'
	};

	const STATUS_CLASS: Record<Enrollment['status'], string> = {
		pending: 'bg-amber-50 text-amber-700 ring-amber-200',
		approved: 'bg-green-50 text-green-700 ring-green-200',
		rejected: 'bg-red-50 text-red-700 ring-red-200',
		completed: 'bg-slate-100 text-slate-600 ring-slate-200'
	};

	const FILTERS: Array<{ value: FilterType; label: string }> = [
		{ value: 'all', label: '全部' },
		{ value: 'online', label: '线上课程' },
		{ value: 'offline', label: '线下课程' }
	];

	/** 当前筛选：全部 / 线上 / 线下 */
	let activeFilter = $state<FilterType>('all');

	/** 正在编辑的报名记录，非空时打开修改弹窗 */
	let editingApp = $state<Enrollment | null>(null);

	let filteredEnrollments = $derived(
		activeFilter === 'all'
			? enrollmentsStore.enrollments
			: enrollmentsStore.enrollments.filter((app) => app.type === activeFilter)
	);

	onMount(() => {
		enrollmentsStore.init(authStore.currentUser?.id ?? null);
	});

	function switchFilter(value: FilterType) {
		activeFilter = value;
	}

	/** 构建修改报名信息的表单 schema（线上课程仅可改联系方式） */
	function buildEditSchema(app: Enrollment): SectionedFormSchema {
		const fields: FormField[] = [
			{ name: 'name', label: '姓名', type: 'text', placeholder: '请输入姓名', required: true },
			{ name: 'phone', label: '手机号', type: 'tel', placeholder: '请输入手机号', required: true },
			{
				name: 'address',
				label: '常用地址',
				type: 'text',
				placeholder: '请输入常用地址',
				required: true,
				fullWidth: true
			}
		];
		const zObject: Record<string, z.ZodTypeAny> = {
			name: z.string().min(1, '姓名不能为空'),
			phone: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式不正确'),
			address: z.string().min(1, '常用地址不能为空')
		};

		if (app.type === 'offline') {
			// 培训地点用选择框重建，选项与报名表单一致（持久化于 locationOptions）；
			// 旧记录无选项时回退为仅含当前值的单选项，保持字段类型一致
			fields.push({
				name: 'location',
				label: '培训地点',
				type: 'select',
				required: true,
				options: app.locationOptions?.length
					? app.locationOptions
					: [{ label: app.location || '培训地点', value: app.location || '' }]
			});
			fields.push({
				name: 'timeSlot',
				label: '培训时段',
				type: 'select',
				required: true,
				options: [
					{ label: '上午 09:00 - 12:00', value: 'morning' },
					{ label: '下午 14:00 - 17:00', value: 'afternoon' }
				]
			});
			zObject.location = z.string().min(1, '请填写培训地点');
			zObject.timeSlot = z.string().min(1, '请选择培训时段');
		}

		const sections: FormSection[] = [{ id: 'edit', title: '报名信息', fields }];

		// 特殊活动课程：追加额外填写字段（如选择部门、选择岗位）
		if (app.extraFields?.length) {
			const extraFields: FormField[] = app.extraFields.map((f) => ({
				name: f.name,
				label: f.label,
				type: f.type,
				required: f.required,
				options: f.options
			}));
			extraFields.forEach((field) => {
				if (!field.required && field.type === 'select') {
					zObject[field.name] = z.string().optional();
				} else {
					zObject[field.name] = z.string().min(1, `${field.label}不能为空`);
				}
			});
			sections.push({ id: 'extra', title: '附加信息', fields: extraFields });
		}

		return {
			sections,
			validationSchema: z.object(zObject)
		};
	}

	function getEditInitialData(app: Enrollment): FormValues {
		const initial: FormValues = {
			name: app.name,
			phone: app.phone,
			address: app.address ?? '',
			location: app.location ?? '',
			timeSlot: app.timeSlot ?? ''
		};
		for (const f of app.extraFields ?? []) {
			initial[f.name] = f.value;
		}
		return initial;
	}

	function handleEditSubmit(data: FormValues) {
		if (!editingApp) return;
		const extraFields = (editingApp.extraFields ?? []).map((f) => ({
			...f,
			value: data[f.name] ?? ''
		}));
		enrollmentsStore.update(editingApp.id, {
			name: data.name as string,
			phone: data.phone as string,
			address: data.address as string,
			location: data.location,
			timeSlot: data.timeSlot,
			extraFields
		});
		messageStore.success('报名信息已成功更新');
		editingApp = null;
	}

	function closeEdit() {
		editingApp = null;
	}
</script>

<Message />

<div class="min-h-screen bg-slate-50 p-6 md:p-10">
	<div class="mx-auto max-w-7xl">
		<header class="mb-8">
			<h1 class="text-3xl font-bold text-slate-900">报名信息</h1>
			<p class="mt-2 text-slate-500">查看和管理您的所有培训报名记录</p>
		</header>

		{#if enrollmentsStore.enrollments.length === 0}
			<div class="rounded-xl border border-slate-200 bg-white p-12 text-center">
				<div
					class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100"
				>
					<svg class="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
						></path>
					</svg>
				</div>
				<h3 class="text-lg font-medium text-slate-900">暂无报名信息</h3>
				<p class="mt-2 text-slate-500">您可以在课程列表中选择感兴趣的课程进行报名。</p>
				<a
					href={resolve('/courses')}
					class="mt-6 inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
				>
					去报名
				</a>
			</div>
		{:else}
			<!-- 类型筛选：线上课程专属入口 -->
			<div class="mb-5 inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
				{#each FILTERS as item (item.value)}
					<button
						type="button"
						onclick={() => switchFilter(item.value)}
						aria-pressed={activeFilter === item.value}
						class="rounded-md px-4 py-1.5 text-sm font-medium transition-colors {activeFilter ===
						item.value
							? 'bg-blue-600 text-white shadow-sm'
							: 'text-slate-600 hover:text-slate-900'}"
					>
						{item.label}
					</button>
				{/each}
			</div>

			{#snippet statusCell(app: Enrollment)}
				<span
					class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset {STATUS_CLASS[
						app.status
					]}"
				>
					{STATUS_LABEL[app.status]}
				</span>
			{/snippet}
			{#snippet actionsCell(app: Enrollment)}
				<button
					type="button"
					onclick={() => (editingApp = app)}
					class="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-white px-3 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
				>
					<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11 16.828 7 18l1.172-4L17.586 4.586z"
						></path></svg
					>
					修改
				</button>
			{/snippet}

			<DataTable
				data={filteredEnrollments}
				columns={enrollColumns}
				rowKey="id"
				emptyText="暂无报名记录"
				snippets={{ status: statusCell, actions: actionsCell }}
			/>
		{/if}
	</div>
</div>

{#if editingApp}
	<Modal title="修改报名信息" onClose={closeEdit}>
		{#snippet header()}
			{#if editingApp}
				<p class="text-sm font-medium text-slate-700">{editingApp.courseName}</p>
				<p class="mt-1 text-xs text-slate-500">
					{TYPE_LABEL[editingApp.type]} · {formatStartTime(editingApp.startTime)}
				</p>
			{/if}
		{/snippet}

		<DynamicForm
			schema={buildEditSchema(editingApp!)}
			initialData={getEditInitialData(editingApp!)}
			onSubmit={handleEditSubmit}
			onCancel={closeEdit}
			submitText="保存修改"
		/>
	</Modal>
{/if}
