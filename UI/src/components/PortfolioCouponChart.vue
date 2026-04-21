<template>
	<div class="space-y-4 rounded-box border border-base-300 bg-base-100 p-4">
		<div class="flex items-center justify-between gap-3">
			<h3 class="text-base font-semibold text-base-content">Купоны на ближайший год</h3>
			<span class="text-xs text-base-content/60">Итого: {{ formatMoney(totalCouponsRub) }}</span>
		</div>

		<div v-if="items.length < 1" class="rounded-box bg-base-200 px-4 py-6 text-sm text-base-content/70">
			Нет данных по купонам.
		</div>

		<div v-else class="overflow-hidden rounded-box bg-base-200 p-2">
			<v-chart :option="chartOption" autoresize class="h-80 w-full" />
		</div>
	</div>
</template>

<script lang="ts" setup>
import { computed, type PropType } from "vue"
import { use } from "echarts/core"
import { BarChart } from "echarts/charts"
import { GridComponent, TooltipComponent } from "echarts/components"
import { CanvasRenderer } from "echarts/renderers"
import VChart from "vue-echarts"
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

const totalCouponsRub = computed(() => props.items.reduce((sum, item) => sum + item.amountRub, 0))

const shortLabel = (label: string) => label.replace(/\s+\d{4}\s*г\.?$/u, "")

const chartOption = computed(() => ({
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
		axisTick: {
			show: false,
		},
		axisLine: {
			lineStyle: {
				color: "rgba(148, 163, 184, 0.35)",
			},
		},
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
			lineStyle: {
				color: "rgba(148, 163, 184, 0.2)",
			},
		},
	},
	tooltip: {
		trigger: "axis",
		axisPointer: {
			type: "shadow",
		},
		backgroundColor: "rgba(15, 23, 42, 0.92)",
		borderWidth: 0,
		textStyle: {
			color: "#f8fafc",
		},
		formatter: (params: { dataIndex: number }[]) => {
			const item = props.items[params[0]?.dataIndex ?? 0]
			if (!item) {
				return ""
			}

			return item.label + "<br/>" + formatMoney(item.amountRub)
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
				itemStyle: {
					color: "#1d4ed8",
				},
			},
		},
	],
}))
</script>
