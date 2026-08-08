import { describe, it, expect } from 'vitest';
import {
	getCourseRankingOption,
	getTypeDistributionOption,
	getDepartmentDistributionOption,
	CHART_COLORS
} from './chart-options';

describe('chart-options.ts', () => {
	it('should return correct course ranking option', () => {
		const names = ['Course A', 'Course B'];
		const values = [100, 50];

		const option = getCourseRankingOption(names, values);

		// @ts-expect-error 访问未公开在类型定义中的 ECharts 内部字段
		expect(option.yAxis.data).toEqual(names);
		// @ts-expect-error 访问未公开在类型定义中的 ECharts 内部字段
		expect(option.series[0].data).toEqual(values);
		// @ts-expect-error 访问未公开在类型定义中的 ECharts 内部字段
		expect(option.series[0].name).toBe('申请人数');
	});

	it('should return correct type distribution option', () => {
		const data = [
			{ name: '线上', value: 30 },
			{ name: '线下', value: 20 }
		];

		const option = getTypeDistributionOption(data);

		expect(option.color).toEqual(CHART_COLORS);
		// @ts-expect-error 访问未公开在类型定义中的 ECharts 内部字段
		expect(option.series[0].data).toEqual(data);
		// @ts-expect-error 访问未公开在类型定义中的 ECharts 内部字段
		expect(option.series[0].name).toBe('培训类型');
	});

	it('should return correct department distribution option', () => {
		const names = ['Dept A', 'Dept B'];
		const values = [15, 10];

		const option = getDepartmentDistributionOption(names, values);

		// @ts-expect-error 访问未公开在类型定义中的 ECharts 内部字段
		expect(option.xAxis.data).toEqual(names);
		// @ts-expect-error 访问未公开在类型定义中的 ECharts 内部字段
		expect(option.series[0].data).toEqual(values);
		// @ts-expect-error 访问未公开在类型定义中的 ECharts 内部字段
		expect(option.series[0].name).toBe('参与人次');
	});
});
