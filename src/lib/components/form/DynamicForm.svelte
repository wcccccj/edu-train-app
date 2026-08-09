<script lang="ts">
	import { z } from 'zod';
	import type { SectionedFormSchema, FormValues, FormField, FormSection } from './form.types';

	let {
		schema,
		initialData = {},
		onSubmit,
		onCancel,
		submitText = '提交',
		cancelText = '取消'
	} = $props<{
		schema: SectionedFormSchema;
		initialData?: FormValues;
		onSubmit: (data: FormValues) => void;
		onCancel?: () => void;
		submitText?: string;
		cancelText?: string;
	}>();

	let formData = $state<FormValues>(
		(() => {
			const data = $state.snapshot(initialData) || {};
			schema.sections.forEach((sec: FormSection) => {
				sec.fields.forEach((f: FormField) => {
					if (data[f.name] === undefined) {
						if (f.type === 'select' && f.options && f.options.length === 1) {
							data[f.name] = f.options[0].value;
						} else {
							data[f.name] = '';
						}
					}
				});
			});
			return data;
		})()
	);
	let errors = $state<Record<string, string>>({});

	function validate() {
		const result = schema.validationSchema.safeParse(formData);
		if (!result.success) {
			const newErrors: Record<string, string> = {};
			result.error.issues.forEach((e: z.ZodIssue) => {
				if (e.path && e.path[0]) {
					newErrors[e.path[0].toString()] = e.message;
				}
			});
			errors = newErrors;
			return false;
		}
		errors = {};
		return true;
	}

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (validate()) {
			onSubmit($state.snapshot(formData));
		}
	}

	function handleInput(name: string, value: string) {
		formData[name] = value;
		if (errors[name]) {
			errors[name] = '';
		}
	}
</script>

{#snippet sectionFields(section: FormSection)}
	{#each section.fields as field (field.name)}
		<div class="flex flex-col gap-1.5 {field.fullWidth ? 'sm:col-span-2' : ''}">
			<label for={field.name} class="flex gap-1 text-sm font-medium text-slate-700">
				{field.label}
				{#if field.required}
					<span class="text-red-500">*</span>
				{/if}
			</label>

			{#if field.type === 'select'}
				<select
					id={field.name}
					name={field.name}
					value={formData[field.name] || ''}
					oninput={(e) => handleInput(field.name, e.currentTarget.value)}
					disabled={field.disabled}
					class="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 transition-colors focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
				>
					<option value="" disabled hidden>请选择{field.label}</option>
					{#if field.options}
						{#each field.options as option (option.value)}
							<option value={option.value}>{option.label}</option>
						{/each}
					{/if}
				</select>
			{:else if field.type === 'textarea'}
				<textarea
					id={field.name}
					name={field.name}
					placeholder={field.placeholder}
					value={formData[field.name] || ''}
					oninput={(e) => handleInput(field.name, e.currentTarget.value)}
					disabled={field.disabled}
					rows="4"
					class="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 transition-colors focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
				></textarea>
			{:else}
				<input
					id={field.name}
					type={field.type}
					name={field.name}
					placeholder={field.placeholder}
					value={formData[field.name] || ''}
					oninput={(e) => handleInput(field.name, e.currentTarget.value)}
					disabled={field.disabled}
					class="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 transition-colors focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
				/>
			{/if}

			{#if errors[field.name]}
				<span class="text-sm text-red-500">{errors[field.name]}</span>
			{/if}
		</div>
	{/each}
{/snippet}

<form class="space-y-6" onsubmit={handleSubmit}>
	<div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
		<div class="space-y-8">
			{#each schema.sections as section (section.id)}
				{#if section.theme === 'highlight'}
					<div class="rounded-xl border border-blue-100 bg-[#F4F7FB] p-5">
						<div class="mb-5 flex items-center gap-3">
							<svg class="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
								<path
									d="M12 2L3 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V8.14l7-3.11v7.96z"
								/>
							</svg>
							<h3 class="text-base font-medium text-slate-900">{section.title}</h3>
							{#if section.badge}
								<span class="rounded bg-blue-200/50 px-2 py-1 text-xs font-medium text-blue-700"
									>{section.badge}</span
								>
							{/if}
						</div>
						<div class="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
							{@render sectionFields(section)}
						</div>
					</div>
				{:else}
					<div>
						<h3 class="mb-5 border-b border-slate-200 pb-3 text-base font-medium text-slate-900">
							{section.title}
						</h3>
						<div class="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
							{@render sectionFields(section)}
						</div>
					</div>
				{/if}
			{/each}
		</div>
	</div>

	<div class="flex gap-4">
		{#if onCancel}
			<button
				type="button"
				onclick={onCancel}
				class="flex-1 rounded-md border border-blue-200 bg-white px-4 py-2 text-sm text-blue-600 transition-colors hover:bg-blue-50 focus:ring-2 focus:ring-slate-200 focus:ring-offset-2 focus:outline-none"
			>
				{cancelText}
			</button>
		{/if}
		<button
			type="submit"
			class="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:outline-none"
		>
			{submitText}
		</button>
	</div>
</form>
