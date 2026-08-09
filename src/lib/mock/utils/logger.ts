/**
 * Mock 服务统一日志工具
 * 所有 mock 路由调用 logRequest() 打印请求概要
 */

const COLOR_RESET = '\x1b[0m';
const COLOR_GREEN = '\x1b[32m';
const COLOR_YELLOW = '\x1b[33m';
const COLOR_RED = '\x1b[31m';
const COLOR_CYAN = '\x1b[36m';

function colorize(text: string, color: string): string {
	// 在 SvelteKit dev 服务器下 color 输出可能被打断，安全起见只在 dev 启用
	return import.meta.env.DEV ? `${color}${text}${COLOR_RESET}` : text;
}

function statusColor(status: number): string {
	if (status >= 500) return COLOR_RED;
	if (status >= 400) return COLOR_YELLOW;
	return COLOR_GREEN;
}

export function logRequest(
	method: string,
	path: string,
	status: number,
	durationMs: number,
	extra?: string
): void {
	const stamp = new Date().toISOString().slice(11, 23);
	const tag = colorize('[MOCK]', COLOR_CYAN);
	const methodStr = colorize(method.padEnd(6), COLOR_CYAN);
	const statusStr = colorize(String(status), statusColor(status));
	const extraStr = extra ? ` ${colorize(extra, COLOR_YELLOW)}` : '';
	console.log(`${tag} ${stamp} ${methodStr} ${path} → ${statusStr} (${durationMs}ms)${extraStr}`);
}

export function logWarn(scope: string, message: string): void {
	console.warn(`${colorize('[MOCK]', COLOR_CYAN)} ${colorize(scope, COLOR_YELLOW)} ${message}`);
}

export function logError(scope: string, message: string): void {
	console.error(`${colorize('[MOCK]', COLOR_CYAN)} ${colorize(scope, COLOR_RED)} ${message}`);
}
