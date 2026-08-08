import type { EChartsCoreOption } from 'echarts';

// 全局基础配置
export const CHART_COLORS = ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'];

// 1. 课程热度排行 (柱状图)
export const getCourseRankingOption = (names: string[], values: number[]): EChartsCoreOption => ({
	tooltip: {
		trigger: 'axis',
		axisPointer: { type: 'shadow' }
	},
	grid: {
		top: '10%',
		left: '3%',
		right: '4%',
		bottom: '3%',
		containLabel: true
	},
	xAxis: {
		type: 'value',
		boundaryGap: [0, 0.01],
		axisLabel: {
			color: '#64748B'
		},
		splitLine: {
			lineStyle: {
				color: '#E2E8F0',
				type: 'dashed'
			}
		}
	},
	yAxis: {
		type: 'category',
		data: names,
		axisLabel: {
			color: '#475569',
			interval: 0,
			width: 100,
			overflow: 'truncate'
		},
		axisTick: { show: false },
		axisLine: { lineStyle: { color: '#CBD5E1' } }
	},
	series: [
		{
			name: '申请人数',
			type: 'bar',
			data: values,
			itemStyle: {
				color: '#3B82F6',
				borderRadius: [0, 4, 4, 0]
			},
			barWidth: '20'
		}
	]
});

// 2. 培训类型分布 (饼图)
export const getTypeDistributionOption = (
	data: { name: string; value: number }[]
): EChartsCoreOption => ({
	tooltip: {
		trigger: 'item'
	},
	legend: {
		top: 'bottom',
		left: 'center',
		textStyle: { color: '#475569' }
	},
	color: CHART_COLORS,
	series: [
		{
			name: '培训类型',
			type: 'pie',
			radius: ['40%', '70%'],
			avoidLabelOverlap: false,
			itemStyle: {
				borderRadius: 6,
				borderColor: '#fff',
				borderWidth: 2
			},
			label: {
				show: false,
				position: 'center'
			},
			emphasis: {
				label: {
					show: true,
					fontSize: 16,
					fontWeight: 'bold',
					color: '#1E293B'
				}
			},
			labelLine: {
				show: false
			},
			data
		}
	]
});

// 3. 部门参与情况 (折线图或柱状图)
export const getDepartmentDistributionOption = (
	names: string[],
	values: number[]
): EChartsCoreOption => ({
	tooltip: {
		trigger: 'axis',
		axisPointer: { type: 'shadow' }
	},
	grid: {
		top: '10%',
		left: '3%',
		right: '4%',
		bottom: '10%',
		containLabel: true
	},
	xAxis: {
		type: 'category',
		data: names,
		axisLabel: {
			color: '#475569',
			interval: 0,
			rotate: 30
		},
		axisTick: { alignWithLabel: true },
		axisLine: { lineStyle: { color: '#CBD5E1' } }
	},
	yAxis: {
		type: 'value',
		axisLabel: { color: '#64748B' },
		splitLine: {
			lineStyle: {
				color: '#E2E8F0',
				type: 'dashed'
			}
		}
	},
	series: [
		{
			name: '参与人次',
			type: 'bar',
			data: values,
			itemStyle: {
				color: '#60A5FA',
				borderRadius: [4, 4, 0, 0]
			},
			barWidth: '40%'
		}
	]
});
