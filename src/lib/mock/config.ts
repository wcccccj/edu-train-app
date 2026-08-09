/**
 * 环境开关：控制 mock 服务是否启用
 *
 * 规则：
 *  - 开发环境（import.meta.env.DEV）默认启用
 *  - 生产环境默认禁用
 *  - MOCK_FORCE=true 可在生产/演示环境强制启用
 *  - MOCK_ENABLED=false 可在任何环境显式禁用
 */
export const MOCK_ENABLED: boolean =
	process.env.MOCK_ENABLED !== 'false' &&
	(import.meta.env.DEV || process.env.MOCK_FORCE === 'true');

export function isMockEnabled(): boolean {
	return MOCK_ENABLED;
}
