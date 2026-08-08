import { describe, it, expect } from 'vitest';
import { truncateText, buildEllipsis } from './ellipsis';

describe('truncateText · 中部省略字符串裁剪', () => {
	it('文本足够短时不裁剪，原样返回', () => {
		expect(truncateText('hello', 'middle')).toBe('hello');
	});

	it('中部省略：保留头部与尾部字符，中间拼接省略符号', () => {
		const long = 'Svelte 5 Runes 响应式系统深入实战与最佳实践';
		const result = truncateText(long, 'middle');
		expect(result).toBe('Svelte 5 R…战与最佳实践');
	});

	it('支持自定义省略符号与头部/尾部保留字符数', () => {
		const long = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
		expect(truncateText(long, 'middle', '...', 4, 4)).toBe('ABCD...WXYZ');
	});

	it('head / tail 位置交由 CSS 处理，不做字符串裁剪', () => {
		expect(truncateText('hello world', 'head')).toBe('hello world');
		expect(truncateText('hello world', 'tail')).toBe('hello world');
	});

	it('边界：刚好等于保留长度+符号时不裁剪', () => {
		expect(truncateText('ABCD…WXYZ', 'middle', '…', 4, 4)).toBe('ABCD…WXYZ');
	});
});

describe('buildEllipsis · 省略样式生成', () => {
	it('默认配置：单行尾部省略', () => {
		const meta = buildEllipsis(true);
		expect(meta.position).toBe('tail');
		expect(meta.symbol).toBe('…');
		expect(meta.className).toContain('overflow-hidden');
		expect(meta.className).toContain('whitespace-nowrap');
		expect(meta.className).toContain('text-ellipsis');
		expect(meta.style).toBe('');
		expect(meta.showTooltip).toBe(true);
		expect(meta.isMiddle).toBe(false);
	});

	it('尾部单行：无内联样式', () => {
		const meta = buildEllipsis({ position: 'tail' });
		expect(meta.style).toBe('');
	});

	it('头部省略：生成 RTL 内联样式使省略号位于左侧', () => {
		const meta = buildEllipsis({ position: 'head' });
		expect(meta.style).toContain('direction:rtl');
		expect(meta.className).toContain('text-ellipsis');
		expect(meta.isMiddle).toBe(false);
	});

	it('中部省略：标记 isMiddle 以便渲染前裁剪', () => {
		const meta = buildEllipsis({ position: 'middle', symbol: '***' });
		expect(meta.isMiddle).toBe(true);
		expect(meta.symbol).toBe('***');
		expect(meta.style).toBe('');
	});

	it('多行截断（仅 tail）：生成 -webkit-line-clamp 内联样式', () => {
		const meta = buildEllipsis({ position: 'tail', lines: 2 });
		expect(meta.style).toContain('-webkit-line-clamp:2');
		expect(meta.style).toContain('display:-webkit-box');
	});

	it('多行截断在非 tail 位置退化为单行省略', () => {
		const meta = buildEllipsis({ position: 'middle', lines: 2 });
		expect(meta.style).not.toContain('-webkit-line-clamp');
		expect(meta.className).toContain('whitespace-nowrap');
	});

	it('可关闭 tooltip 与自定义 headChars/tailChars', () => {
		const meta = buildEllipsis({ showTooltip: false, headChars: 3, tailChars: 2 });
		expect(meta.showTooltip).toBe(false);
		expect(meta.headChars).toBe(3);
		expect(meta.tailChars).toBe(2);
	});
});
