<script lang="ts">
	import type { SectionedFormSchema } from './form.types';
	import { EnrollmentStore } from './EnrollmentStore.svelte';
	import DynamicForm from './DynamicForm.svelte';
	import Preview from './Preview.svelte';

	let {
		schema,
		sessionKey,
		onComplete,
		initialData,
		onCancel
	} = $props<{
		schema: SectionedFormSchema;
		sessionKey: string;
		onComplete: (data: Record<string, any>) => void | Promise<void>;
		initialData?: Record<string, any>;
		onCancel?: () => void;
	}>();

	const store = new EnrollmentStore(sessionKey, initialData);

	let submitStatus = $state<'idle' | 'submitting' | 'success' | 'error'>('idle');
	let submitError = $state<string>('');

	function handleFormSubmit(data: Record<string, any>) {
		store.updateData(data);
		store.setStep('preview');
	}

	function handleEdit(fieldName?: string) {
		store.setStep('form');
		if (fieldName && typeof document !== 'undefined') {
			setTimeout(() => {
				const el = document.getElementById(fieldName);
				if (el) el.focus();
			}, 0);
		}
	}

	async function handleFinalSubmit() {
		submitStatus = 'submitting';
		submitError = '';
		try {
			const result = onComplete(store.data);
			if (result instanceof Promise) {
				await result;
			}
			submitStatus = 'success';
			store.clear();
		} catch (e) {
			submitStatus = 'error';
			submitError = e instanceof Error ? e.message : '提交失败，请稍后重试';
		}
	}

	function handleReset() {
		submitStatus = 'idle';
		submitError = '';
		store.setStep('form');
	}
</script>

{#if submitStatus === 'success'}
	<div class="py-8 text-center">
		<div class="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
			<svg class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M5 13l4 4L19 7"
				/>
			</svg>
		</div>
		<h3 class="mb-2 text-xl font-medium text-slate-900">报名成功</h3>
		<p class="mb-6 text-slate-500">您已成功提交报名信息</p>
		{#if onCancel}
			<button
				type="button"
				onclick={onCancel}
				class="rounded-md bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:outline-none"
			>
				完成
			</button>
		{:else}
			<button
				type="button"
				onclick={handleReset}
				class="rounded-md bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:outline-none"
			>
				返回重新报名
			</button>
		{/if}
	</div>
{:else}
	{#if store.step === 'form'}
		<DynamicForm
			{schema}
			initialData={store.data}
			onSubmit={handleFormSubmit}
			onCancel={onCancel}
			submitText="保存信息"
		/>
	{:else if store.step === 'preview'}
		<div class="space-y-4">
			<Preview
				{schema}
				data={store.data}
				onEdit={handleEdit}
				onSubmit={handleFinalSubmit}
				isSubmitting={submitStatus === 'submitting'}
			/>
			{#if submitStatus === 'error'}
				<div
					class="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
				>
					<svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
						/>
					</svg>
					<span>{submitError}</span>
				</div>
			{/if}
		</div>
	{/if}
{/if}
