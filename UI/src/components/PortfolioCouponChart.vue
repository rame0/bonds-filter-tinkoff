<template>
	<div class="space-y-4 rounded-box border border-base-300 bg-base-100 p-4">
		<div class="flex items-center justify-between gap-3">
			<h3 class="text-base font-semibold text-base-content">Купоны на ближайший год</h3>
			<span class="text-xs text-base-content/60">Сумма по месяцам, RUB</span>
		</div>

		<div v-if="items.length < 1" class="rounded-box bg-base-200 px-4 py-6 text-sm text-base-content/70">
			Нет данных по купонам.
		</div>

		<div v-else class="grid grid-cols-12 gap-2">
			<div
				v-for="item in items"
				:key="item.month"
				class="flex min-w-0 flex-col items-center gap-2"
			>
				<div class="flex h-36 w-full items-end rounded-box bg-base-200 px-1 py-2">
					<div
						class="w-full rounded-t-md bg-primary transition-all"
						:style="{ height: `${getBarHeight(item.amountRub)}%` }"
					></div>
				</div>
				<div class="text-center text-[11px] leading-tight text-base-content/70">{{ shortLabel(item.label) }}</div>
				<div class="text-center text-[11px] font-medium text-base-content">{{ formatMoney(item.amountRub) }}</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { computed, type PropType } from "vue"
import type { PortfolioCouponScheduleItem } from "@/data/Interfaces/PortfolioMetrics"
import { formatMoney } from "@/utils/format"

const props = defineProps({
	items: {
		type: Array as PropType<PortfolioCouponScheduleItem[]>,
		default: () => []
	}
})

const maxAmount = computed(() => Math.max(...props.items.map(item => item.amountRub), 0))

const getBarHeight = (amount: number) => {
	if (maxAmount.value <= 0) {
		return 0
	}

	return Math.max(4, Math.round((amount / maxAmount.value) * 100))
}

const shortLabel = (label: string) => label.replace(/\s+\d{4}\s*г\.?$/u, "")
</script>
