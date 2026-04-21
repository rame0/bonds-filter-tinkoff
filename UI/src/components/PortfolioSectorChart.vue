<template>
	<div class="space-y-4 rounded-box border border-base-300 bg-base-100 p-4">
		<div class="flex items-center justify-between gap-3">
			<h3 class="text-base font-semibold text-base-content">Структура по секторам</h3>
			<span class="text-xs text-base-content/60">Текущая цена без НКД, RUB</span>
		</div>

		<div v-if="items.length < 1" class="rounded-box bg-base-200 px-4 py-6 text-sm text-base-content/70">
			Нет данных по секторам.
		</div>

		<div v-else ref="chartElement" class="h-80 w-full rounded-box bg-base-200"></div>
	</div>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch, type PropType } from "vue"
import { PieChart } from "echarts/charts"
import { GraphicComponent, TooltipComponent } from "echarts/components"
import { init, use, type EChartsType } from "echarts/core"
import { CanvasRenderer } from "echarts/renderers"
import SectorsCollation from "@/data/collations/SectorsCollation"
import type { PortfolioSectorAllocationItem } from "@/data/Interfaces/PortfolioMetrics"
import { formatMoney, formatPercent } from "@/utils/format"

use([CanvasRenderer, PieChart, GraphicComponent, TooltipComponent])

const colors = ["#2563eb", "#7c3aed", "#ea580c", "#059669", "#dc2626", "#ca8a04", "#0f766e", "#9333ea"]

const props = defineProps({
	items: {
		type: Array as PropType<PortfolioSectorAllocationItem[]>,
		default: () => [],
	},
})

const chartElement = ref<HTMLDivElement | null>(null)
const totalAmount = computed(() => props.items.reduce((sum, item) => sum + item.amountRub, 0))

let chart: EChartsType | undefined
let resizeObserver: ResizeObserver | undefined

const renderChart = () => {
	if (!chartElement.value) {
		return
	}

	if (!chart) {
		chart = init(chartElement.value)
	}

	chart.setOption({
		animation: false,
		tooltip: {
			trigger: "item",
			backgroundColor: "rgba(15, 23, 42, 0.92)",
			borderWidth: 0,
			textStyle: { color: "#f8fafc" },
			formatter: (params: { data: { amountRub: number; sharePct: number }; name: string }) => {
				return [params.name, formatMoney(params.data.amountRub), formatPercent(params.data.sharePct)].join("<br/>")
			},
		},
		graphic: [
			{
				type: "text",
				left: "center",
				top: "42%",
				style: {
					text: formatMoney(totalAmount.value),
					textAlign: "center",
					fill: "#0f172a",
					fontSize: 15,
					fontWeight: 600,
				},
			},
			{
				type: "text",
				left: "center",
				top: "54%",
				style: {
					text: "Всего",
					textAlign: "center",
					fill: "rgba(15, 23, 42, 0.7)",
					fontSize: 12,
				},
			},
		],
		series: [
			{
				type: "pie",
				radius: ["54%", "78%"],
				center: ["50%", "50%"],
				label: { show: false },
				labelLine: { show: false },
				itemStyle: {
					borderColor: "#f8fafc",
					borderWidth: 3,
				},
				data: props.items.map((item, index) => ({
					value: item.amountRub,
					name: SectorsCollation.getLabel(item.sector),
					amountRub: item.amountRub,
					sharePct: item.sharePct,
					itemStyle: { color: colors[index % colors.length] },
				})),
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
