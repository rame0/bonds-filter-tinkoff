<template>
	<div class="space-y-4 rounded-box border border-base-300 bg-base-100 p-4">
		<div class="flex items-center justify-between gap-3">
			<h3 class="text-base font-semibold text-base-content">Структура по секторам</h3>
			<span class="text-xs text-base-content/60">Текущая цена без НКД, RUB</span>
		</div>

		<div v-if="items.length < 1" class="rounded-box bg-base-200 px-4 py-6 text-sm text-base-content/70">
			Нет данных по секторам.
		</div>

		<div v-else class="grid gap-4 md:grid-cols-[12rem_minmax(0,1fr)] md:items-center">
			<div class="mx-auto h-48 w-full max-w-48 overflow-hidden rounded-full bg-base-200">
				<v-chart :option="chartOption" autoresize class="h-48 w-48" />
			</div>

			<div class="space-y-2">
				<div
					v-for="(item, index) in items"
					:key="item.sector"
					class="flex items-start justify-between gap-3 rounded-box bg-base-200 px-3 py-2 text-sm"
				>
					<div class="flex min-w-0 items-start gap-2">
						<span class="mt-1 h-3 w-3 shrink-0 rounded-full" :style="{ backgroundColor: colors[index % colors.length] }"></span>
						<span class="truncate">{{ SectorsCollation.getLabel(item.sector) }}</span>
					</div>
					<div class="shrink-0 text-right">
						<div class="font-medium text-base-content">{{ formatMoney(item.amountRub) }}</div>
						<div class="text-xs text-base-content/70">{{ formatPercent(item.sharePct) }}</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { computed, type PropType } from "vue"
import { PieChart } from "echarts/charts"
import { TooltipComponent } from "echarts/components"
import { use } from "echarts/core"
import { CanvasRenderer } from "echarts/renderers"
import VChart from "vue-echarts"
import SectorsCollation from "@/data/collations/SectorsCollation"
import type { PortfolioSectorAllocationItem } from "@/data/Interfaces/PortfolioMetrics"
import { formatMoney, formatPercent } from "@/utils/format"

use([CanvasRenderer, PieChart, TooltipComponent])

const colors = ["#2563eb", "#7c3aed", "#ea580c", "#059669", "#dc2626", "#ca8a04", "#0f766e", "#9333ea"]

const props = defineProps({
	items: {
		type: Array as PropType<PortfolioSectorAllocationItem[]>,
		default: () => [],
	},
})

const totalAmount = computed(() => props.items.reduce((sum, item) => sum + item.amountRub, 0))

const chartOption = computed(() => ({
	animation: false,
	tooltip: {
		trigger: "item",
		backgroundColor: "rgba(15, 23, 42, 0.92)",
		borderWidth: 0,
		textStyle: {
			color: "#f8fafc",
		},
		formatter: (params: { data: { amountRub: number; sharePct: number }; name: string }) => {
			return [params.name, formatMoney(params.data.amountRub), formatPercent(params.data.sharePct)].join("<br/>")
		},
	},
	graphic: [
		{
			type: "text",
			left: "center",
			top: "40%",
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
			radius: ["58%", "82%"],
			avoidLabelOverlap: false,
			label: { show: false },
			labelLine: { show: false },
			itemStyle: {
				borderColor: "#ffffff",
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
}))
</script>
