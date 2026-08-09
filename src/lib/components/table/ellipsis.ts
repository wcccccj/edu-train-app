/**
 * 表格省略显示辅助函数
 *
 * 集中处理 DataTable 的文本省略逻辑，便于单元测试覆盖纯逻辑：
 * - buildEllipsis：根据配置生成省略所需的类名与内联样式
 * - truncateText：对「中部省略」做字符串裁剪，其余位置由 CSS 处理
 */
import type { EllipsisOptions, EllipsisPosition } from './table.types';

/** 省略计算后的元信息，供组件在单元格内使用 */
export interface EllipsisMeta {
	className: string;
	style: string;
	position: EllipsisPosition;
	symbol: string;
	showTooltip: boolean;
	headChars: number;
	tailChars: number;
	isMiddle: boolean;
}

/** 文本过长时按指定位置裁剪。中部省略需在渲染前拼接符号，其余位置交由 CSS 完成。 */
export function truncateText(
	text: string,
	position: EllipsisPosition,
	symbol = '…',
	headChars = 10,
	tailChars = 6
): string {
	if (position !== 'middle') return text;
	if (text.length <= headChars + tailChars + symbol.length) return text;
	return `${text.slice(0, headChars)}${symbol}${text.slice(-tailChars)}`;
}

/** 根据配置生成省略显示所需的类名与样式 */
export function buildEllipsis(options: EllipsisOptions | true): EllipsisMeta {
	const opts: EllipsisOptions = options === true ? {} : options;
	const position = opts.position ?? 'tail';
	const symbol = opts.symbol ?? '…';
	const lines = opts.lines ?? 1;
	const showTooltip = opts.showTooltip ?? true;
	const headChars = opts.headChars ?? 10;
	const tailChars = opts.tailChars ?? 6;
	const isMiddle = position === 'middle';

	let className = 'overflow-hidden';
	let style = '';

	if (lines > 1 && position === 'tail') {
		// 多行截断：-webkit-line-clamp
		style = `display:-webkit-box;-webkit-line-clamp:${lines};-webkit-box-orient:vertical;word-break:break-all;`;
	} else {
		// 单行省略
		className += ' whitespace-nowrap text-ellipsis';
		if (position === 'head') {
			// 头部省略：借助 RTL 使省略号出现在左侧
			style = 'direction:rtl;text-align:left;';
		}
	}

	return { className, style, position, symbol, showTooltip, headChars, tailChars, isMiddle };
}
