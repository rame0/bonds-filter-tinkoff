<template>
	<div class="space-y-4 rounded-box border border-base-300 bg-base-100 p-4">
		<div class="flex items-center justify-between gap-3">
			<h3 class="text-base font-semibold text-base-content">Купоны на ближайший год</h3>
			<span class="text-xs text-base-content/60">Итого: {{ formatMoney(totalCouponsRub) }}</span>
		</div>

		<div v-if="items.length < 1" class="rounded-box bg-base-200 px-4 py-6 text-sm text-base-content/70">
			Нет данных по купонам.
		</div>

		<div v-else ref="chartElement" class="h-80 w-full rounded-box bg-base-200 p-2"></div>
	</div>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch, type PropType } from "vue"
import { BarChart } from "echarts/charts"
import { GridComponent, TooltipComponent } from "echarts/components"
import { init, use, type EChartsType } from "echarts/core"
import { CanvasRenderer } from "echarts/renderers"
import type { PortfolioCouponScheduleItem } from "@/data/Interfaces/PortfolioMetrics"
import { formatMoney } from "@/utils/format"

use([CanvasRenderer, BarChart, GridComponent, TooltipComponent])

const compactNumberFormatter = new Intl.NumberFormat("ru-RU", {
	maximumFractionDigits: 0,
})

const props = defineProps({
	items: {
		type: Array as PropType<PortfolioCouponScheduleItem[]>,
		default: () => [],
	},
})

const chartElement = ref<HTMLDivElement | null>(null)
const totalCouponsRub = computed(() => props.items.reduce((sum, item) => sum + item.amountRub, 0))

let chart: EChartsType | undefined
let resizeObserver: ResizeObserver | undefined

const shortLabel = (label: string) => label.replace(/\s+\d{4}\s*г\.?$/u, "")

const renderChart = () => {
	if (!chartElement.value) {
		return
	}

	if (!chart) {
		chart = init(chartElement.value)
	}

	chart.setOption({
		animation: false,
		grid: {
			left: 8,
			right: 8,
			top: 12,
			bottom: 8,
			containLabel: true,
		},
		xAxis: {
			type: "category",
			data: props.items.map(item => shortLabel(item.label)),
			axisTick: { show: false },
			axisLine: { lineStyle: { color: "rgba(148, 163, 184, 0.35)" } },
			axisLabel: {
				color: "rgba(15, 23, 42, 0.7)",
				fontSize: 11,
			},
		},
		yAxis: {
			type: "value",
			splitNumber: 4,
			axisLabel: {
				color: "rgba(15, 23, 42, 0.7)",
				formatter: (value: number) => compactNumberFormatter.format(value),
			},
			splitLine: {
				lineStyle: { color: "rgba(148, 163, 184, 0.2)" },
			},
		},
		tooltip: {
			trigger: "axis",
			axisPointer: { type: "shadow" },
			backgroundColor: "rgba(15, 23, 42, 0.92)",
			borderWidth: 0,
			textStyle: { color: "#f8fafc" },
			formatter: (params: { dataIndex: number }[]) => {
				const item = props.items[params[0]?.dataIndex ?? 0]
				return item ? item.label + "<br/>" + formatMoney(item.amountRub) : ""
			},
		},
		series: [
			{
				type: "bar",
				data: props.items.map(item => item.amountRub),
				barMaxWidth: 28,
				itemStyle: {
					color: "#2563eb",
					borderRadius: [8, 8, 0, 0],
				},
				emphasis: {
					itemStyle: { color: "#1d4ed8" },
				},
			},
		],
	})
}

onMounted(() => {
	renderChart()

	if (chartElement.value) {
		resizeObserver = new ResizeObserver(() => chart?.resize())
		resizeObserver.observe(chartElement.value)
	}
})

watch(() => props.items, renderChart, { deep: true })

onBeforeUnmount(() => {
	resizeObserver?.disconnect()
	chart?.dispose()
})
</script>
