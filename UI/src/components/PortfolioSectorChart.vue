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
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, type PropType } from "vue"
import { PieChart } from "echarts/charts"
import { GraphicComponent, TooltipComponent } from "echarts/components"
import { init, use, type EChartsType } from "echarts/core"
import { CanvasRenderer } from "echarts/renderers"
import SectorsCollation from "@/data/collations/SectorsCollation"
import type { PortfolioSectorAllocationItem } from "@/data/Interfaces/PortfolioMetrics"
import { formatMoney, formatPercent } from "@/utils/format"

use([CanvasRenderer, PieChart, GraphicComponent, TooltipComponent])

const lightColors = ["#2563eb", "#7c3aed", "#ea580c", "#059669", "#dc2626", "#ca8a04", "#0f766e", "#9333ea"]
const darkColors = ["#f472b6", "#c084fc", "#fb923c", "#34d399", "#f87171", "#facc15", "#2dd4bf", "#a78bfa"]

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
let themeObserver: MutationObserver | undefined

const getThemePalette = () => {
	const isDark = document.documentElement.getAttribute("data-theme") === "dracula"

	return {
		text: isDark ? "#f8fafc" : "#0f172a",
		subtleText: isDark ? "rgba(248, 250, 252, 0.7)" : "rgba(15, 23, 42, 0.7)",
		tooltipBg: isDark ? "rgba(15, 23, 42, 0.94)" : "rgba(15, 23, 42, 0.92)",
		tooltipText: "#f8fafc",
		border: isDark ? "#282a36" : "#f8fafc",
		colors: isDark ? darkColors : lightColors,
	}
}

const renderChart = () => {
	if (!chartElement.value) {
		return
	}

	if (!chart) {
		chart = init(chartElement.value)
	}

	const palette = getThemePalette()

	chart.setOption({
		animation: false,
		tooltip: {
			trigger: "item",
			backgroundColor: palette.tooltipBg,
			borderWidth: 0,
			textStyle: { color: palette.tooltipText },
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
					fill: palette.text,
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
					fill: palette.subtleText,
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
					borderColor: palette.border,
					borderWidth: 3,
				},
				data: props.items.map((item, index) => ({
					value: item.amountRub,
					name: SectorsCollation.getLabel(item.sector),
					amountRub: item.amountRub,
					sharePct: item.sharePct,
					itemStyle: { color: palette.colors[index % palette.colors.length] },
				})),
			},
		],
	})

	chart.resize()
}

onMounted(async () => {
	await nextTick()
	renderChart()

	if (chartElement.value) {
		resizeObserver = new ResizeObserver(() => chart?.resize())
		resizeObserver.observe(chartElement.value)
	}

	themeObserver = new MutationObserver(() => renderChart())
	themeObserver.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ["data-theme"],
	})
})

watch(() => props.items, () => renderChart(), { deep: true })

onBeforeUnmount(() => {
	resizeObserver?.disconnect()
	themeObserver?.disconnect()
	chart?.dispose()
})
</script>
