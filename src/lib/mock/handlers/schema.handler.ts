/**
 * 动态表单 Schema Handler
 * 通过 category 查找预定义的 schema 定义
 */
import type { FormSchema } from '$lib/types/form.types';
import { safetySchema, managementSchema } from '$lib/schemas';

const SCHEMAS: Record<string, FormSchema> = {
	'安全管理': safetySchema,
	'管理能力': managementSchema
};

export function getSchema(category: string): FormSchema | null {
	return SCHEMAS[category] ?? null;
}

export function registerSchema(schema: FormSchema): void {
	SCHEMAS[schema.category] = schema;
}
