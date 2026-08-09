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
			barWidth: '20',
			// 直接展示数据值，无需悬停即可查看
			label: {
				show: true,
				position: 'right',
				distance: 8,
				color: '#1E293B',
				fontSize: 12,
				fontWeight: 600,
				formatter: '{c}'
			},
			// 数据过多或小屏空间不足时自动隐藏重叠标签
			labelLayout: { hideOverlap: true }
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
				show: true,
				position: 'outside',
				formatter: '{b}\n{d}%',
				color: '#475569',
				fontSize: 12
			},
			labelLine: {
				show: true,
				length: 12,
				length2: 10,
				lineStyle: { color: '#94A3B8' }
			},
			emphasis: {
				label: {
					show: true,
					fontSize: 16,
					fontWeight: 'bold',
					color: '#1E293B'
				}
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
			barWidth: '40%',
			// 直接展示数据值，无需悬停即可查看
			label: {
				show: true,
				position: 'top',
				distance: 4,
				color: '#1E293B',
				fontSize: 11,
				fontWeight: 600,
				formatter: '{c}'
			},
			// 数据过多或小屏空间不足时自动隐藏重叠标签
			labelLayout: { hideOverlap: true }
		}
	]
});

// 4. 近30天报名趋势 (双轴组合图：柱状/面积 + 折线)
export const getDailyTrendOption = (
	dates: string[],
	dailyCounts: number[],
	growthRates: number[]
): EChartsCoreOption => {
	// 浅蓝→深蓝渐变，突出上升势头
	const gradientColors = ['#93C5FD', '#1D4ED8'];
	const barGradient = {
		type: 'linear',
		x: 0,
		y: 0,
		x2: 0,
		y2: 1,
		colorStops: [
			{ offset: 0, color: gradientColors[1] },
			{ offset: 1, color: gradientColors[0] }
		]
	};

	return {
		tooltip: {
			trigger: 'axis',
			axisPointer: { type: 'cross' }
		},
		legend: {
			top: 0,
			right: 0,
			textStyle: { color: '#475569' }
		},
		grid: {
			top: '12%',
			left: '3%',
			right: '4%',
			bottom: '3%',
			containLabel: true
		},
		xAxis: {
			type: 'category',
			data: dates,
			boundaryGap: true,
			axisLabel: { color: '#64748B', fontSize: 11 },
			axisLine: { lineStyle: { color: '#CBD5E1' } },
			axisTick: { alignWithLabel: true }
		},
		yAxis: [
			{
				type: 'value',
				name: '报名人数',
				axisLabel: { color: '#64748B' },
				splitLine: {
					lineStyle: { color: '#E2E8F0', type: 'dashed' }
				}
			},
			{
				type: 'value',
				name: '环比增长率',
				axisLabel: { color: gradientColors[1], formatter: '{value}%' },
				splitLine: { show: false }
			}
		],
		series: [
			{
				name: '每日报名人数',
				type: 'bar',
				data: dailyCounts,
				itemStyle: {
					color: barGradient,
					borderRadius: [3, 3, 0, 0]
				},
				barMaxWidth: 24,
				label: {
					show: false,
					position: 'top',
					fontSize: 9,
					color: '#475569'
				}
			},
			{
				name: '日环比增长率',
				type: 'line',
				yAxisIndex: 1,
				data: growthRates,
				smooth: true,
				symbol: 'circle',
				symbolSize: 6,
				lineStyle: { width: 2, color: gradientColors[1] },
				itemStyle: { color: gradientColors[1] },
				areaStyle: {
					opacity: 0.08,
					color: gradientColors[1]
				}
			}
		]
	};
};

// 5. 过去12个月报名分布 (日历热力图)
export const getCalendarHeatmapOption = (
	heatmapData: [string, number][],
	rangeStart: string,
	rangeEnd: string
): EChartsCoreOption => {
	return {
		tooltip: {
			formatter: (params: { value: [string, number] }) =>
				`${params.value[0]}<br/>报名人数：<b>${params.value[1]}</b>`
		},
		visualMap: {
			min: 0,
			max: 100,
			orient: 'horizontal',
			left: 'center',
			top: 0,
			itemWidth: 10,
			itemHeight: 80,
			textStyle: { color: '#64748B' },
			// 深红代表高峰，黄色为过渡色，浅蓝代表低谷
			inRange: {
				color: ['#DBEAFE', '#FDE68A', '#F59E0B', '#DC2626']
			}
		},
		calendar: {
			top: '18%',
			left: 20,
			right: 20,
			bottom: 10,
			// 使用 "YYYY-MM" 字符串区间，覆盖真实的过去12个月
			range: [rangeStart, rangeEnd],
			cellSize: ['auto', 16],
			itemStyle: { borderWidth: 3, borderColor: '#fff' },
			splitLine: { lineStyle: { color: '#E2E8F0' } },
			yearLabel: { show: true, color: '#475569' },
			dayLabel: {
				firstDay: 1,
				nameMap: ['一', '二', '三', '四', '五', '六', '日'],
				color: '#64748B',
				fontSize: 11
			},
			monthLabel: {
				nameMap: 'cn',
				color: '#475569',
				fontSize: 12
			}
		},
		series: [
			{
				type: 'heatmap',
				coordinateSystem: 'calendar',
				data: heatmapData
			}
		]
	};
};
