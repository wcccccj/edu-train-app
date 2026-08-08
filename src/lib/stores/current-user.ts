/**
 * 当前登录用户的 user_id 持有器
 *
 * 供非 SvelteKit 依赖的模块（如表单组件）读取当前用户标识，
 * 避免其直接依赖 authStore（后者会引入 $app/environment）。
 * 该值由 authStore 在登录 / 登出 / 初始化时更新。
 */
let currentUserId: string | null = null;

export function setCurrentUserId(id: string | null): void {
	currentUserId = id;
}

export function getCurrentUserId(): string | null {
	return currentUserId;
}
