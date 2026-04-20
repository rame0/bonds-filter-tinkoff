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
			<div
				class="mx-auto h-48 w-48 rounded-full border border-base-300"
				:style="{ background: chartGradient }"
			>
				<div class="mx-auto mt-10 flex h-28 w-28 items-center justify-center rounded-full bg-base-100 text-center text-xs text-base-content/70">
					<div>
						<div class="font-semibold text-base-content">{{ formatMoney(totalAmount) }}</div>
						<div>Всего</div>
					</div>
				</div>
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
import SectorsCollation from "@/data/collations/SectorsCollation"
import type { PortfolioSectorAllocationItem } from "@/data/Interfaces/PortfolioMetrics"
import { formatMoney, formatPercent } from "@/utils/format"

const colors = ["#2563eb", "#7c3aed", "#ea580c", "#059669", "#dc2626", "#ca8a04", "#0f766e", "#9333ea"]

const props = defineProps({
	items: {
		type: Array as PropType<PortfolioSectorAllocationItem[]>,
		default: () => []
	}
})

const totalAmount = computed(() => props.items.reduce((sum, item) => sum + item.amountRub, 0))

const chartGradient = computed(() => {
	if (props.items.length < 1) {
		return "conic-gradient(var(--color-base-300) 0deg 360deg)"
	}

	let currentAngle = 0
	return `conic-gradient(${props.items.map((item, index) => {
			const start = currentAngle
			currentAngle += (item.sharePct / 100) * 360
			return `${colors[index % colors.length]} ${start}deg ${currentAngle}deg`
		}).join(", ")})`
})
</script>
