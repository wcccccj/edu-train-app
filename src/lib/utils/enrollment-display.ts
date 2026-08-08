/**
 * 报名信息展示辅助函数
 *
 * 集中处理 /enrollments 页面中的展示逻辑：手机号脱敏、培训地点、
 * 开始时间格式化，便于单元测试覆盖纯逻辑。
 */

/** 手机号脱敏：对 11 位手机号隐藏中间 4 位（如 138****5678） */
export function maskPhone(phone: string | undefined): string {
	if (!phone) return '—';
	const trimmed = phone.trim();
	if (!/^\d{11}$/.test(trimmed)) return trimmed || '—';
	return `${trimmed.slice(0, 3)}****${trimmed.slice(7)}`;
}

/** 培训地点展示：线下课程展示所选地点，线上课程展示「线上」 */
export function resolveLocation(type: string | undefined, location?: string): string {
	if (type === 'online') return '线上';
	return location || '—';
}

/** 开始时间格式化：ISO 字符串转为本地可读格式 */
export function formatStartTime(startTime?: string): string {
	if (!startTime) return '—';
	const date = new Date(startTime);
	if (Number.isNaN(date.getTime())) return '—';
	return date.toLocaleString('zh-CN');
}