<script lang="ts">
	import type { SectionedFormSchema } from './form.types';

	let {
		schema,
		data,
		onEdit,
		onSubmit,
		submitText = '确认提交',
		editText = '修改信息',
		isSubmitting = false
	} = $props<{
		schema: SectionedFormSchema;
		data: Record<string, any>;
		onEdit: (fieldName?: string) => void;
		onSubmit: () => void;
		submitText?: string;
		editText?: string;
		isSubmitting?: boolean;
	}>();

	function getField(fieldName: string) {
		for (const section of schema.sections) {
			const field = section.fields.find((f) => f.name === fieldName);
			if (field) return field;
		}
		return null;
	}

	function getLabel(fieldName: string) {
		return getField(fieldName)?.label || fieldName;
	}

	function getDisplayValue(fieldName: string) {
		const field = getField(fieldName);
		if (!field) return data[fieldName];
		if (field.type === 'select' && field.options) {
			return field.options.find((o) => o.value === data[fieldName])?.label || data[fieldName];
		}
		return data[fieldName];
	}

	function isFieldInSchema(fieldName: string) {
		return !!getField(fieldName);
	}
</script>

<div class="space-y-6">
	<div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
		<h3 class="mb-5 text-lg font-semibold text-slate-900">信息预览</h3>
		<div class="space-y-6">
			{#each schema.sections as section}
				<div>
					<h4 class="mb-3 border-b border-slate-100 pb-2 text-sm font-medium text-slate-900">
						{section.title}
					</h4>
					<dl class="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
						{#each section.fields as field}
							<div class="flex flex-col gap-1">
								<dt class="text-sm text-slate-500">{field.label}</dt>
								<dd class="flex items-center gap-2">
									<span class="text-sm font-medium text-slate-900"
										>{getDisplayValue(field.name) || '-'}</span
									>
									<button
										type="button"
										class="text-xs text-blue-600 transition-colors hover:text-blue-700"
										onclick={() => onEdit(field.name)}
									>
										修改
									</button>
								</dd>
							</div>
						{/each}
					</dl>
				</div>
			{/each}
		</div>
	</div>

	<div class="flex gap-4">
	<button
		type="button"
		onclick={() => onEdit()}
		disabled={isSubmitting}
		class="flex-1 rounded-md border border-blue-200 bg-white px-4 py-2 text-sm text-blue-600 transition-colors hover:bg-blue-50 focus:ring-2 focus:ring-slate-200 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
	>
		{editText}
	</button>
	<button
		type="button"
		onclick={onSubmit}
		disabled={isSubmitting}
		class="flex flex-1 items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
	>
		{#if isSubmitting}
			<svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
				<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
			</svg>
			提交中...
		{:else}
			{submitText}
		{/if}
	</button>
</div>
</div>
