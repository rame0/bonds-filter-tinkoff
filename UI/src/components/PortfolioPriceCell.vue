<template>
	<div class="group relative inline-flex min-w-[8rem] flex-col gap-1">
		<span class="font-medium text-base-content">{{ formatPercent(row.pricePct) }}</span>
		<span class="text-xs text-base-content/60">{{ formatMoney(row.fullPrice, row.currency) }}</span>

		<div class="pointer-events-none invisible absolute left-0 top-full z-20 mt-2 w-64 rounded-box border border-base-300 bg-base-100 p-3 text-xs shadow-xl group-hover:visible">
			<div class="mb-2 font-semibold text-base-content">Детали цены</div>
			<div class="grid grid-cols-[1fr_auto] gap-x-3 gap-y-2 text-base-content/80">
				<span>Цена, %</span>
				<span>{{ formatPercent(row.pricePct) }}</span>
				<span>Номинал</span>
				<span>{{ formatMoney(row.nominal, row.currency) }}</span>
				<span>НКД</span>
				<span>{{ formatMoney(row.aciValue, row.currency) }}</span>
				<span>Полная цена</span>
				<span>{{ formatMoney(row.fullPrice, row.currency) }}</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { PortfolioTableRow } from "@/data/Interfaces/PortfolioTable"
import { formatMoney, formatPercent } from "@/utils/format"

defineProps<{
	row: PortfolioTableRow
}>()
</script>
