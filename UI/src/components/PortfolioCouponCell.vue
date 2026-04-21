<template>
	<div class="group relative inline-flex min-w-[7rem] items-center gap-2">
		<span class="font-medium text-base-content">{{ label }}</span>
		<span v-if="row.couponTooltip.isEstimated" class="badge badge-warning badge-xs">~</span>

		<div class="pointer-events-none invisible absolute left-0 top-full z-20 mt-2 w-72 rounded-box border border-base-300 bg-base-100 p-3 text-xs shadow-xl group-hover:visible">
			<div class="mb-2 flex items-center gap-2">
				<div class="font-semibold text-base-content">График выплат</div>
				<span v-if="row.couponTooltip.isFloating" class="badge badge-info badge-xs">Плавающий</span>
				<span v-if="row.couponTooltip.isAmortizing" class="badge badge-secondary badge-xs">Амортизация</span>
			</div>

			<div v-if="row.couponTooltip.groups.length > 0" class="space-y-2 text-base-content/80">
				<div
					v-for="group in row.couponTooltip.groups"
					:key="`${group.amount}-${group.count}`"
					class="flex items-center justify-between gap-3"
				>
					<span>{{ group.count }} шт.</span>
					<span>{{ formatMoney(group.amount, group.currency) }}</span>
				</div>
			</div>
			<div v-else class="text-base-content/60">Будущих выплат нет.</div>
			<div v-if="row.couponTooltip.isEstimated" class="mt-3 text-warning">
				Часть будущих выплат оценена по последнему известному купону.
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import type { PortfolioTableRow } from "@/data/Interfaces/PortfolioTable"
import { formatMoney } from "@/utils/format"

const props = defineProps<{
	row: PortfolioTableRow
}>()

const label = computed(() => `${props.row.couponCountLeft} шт.`)
</script>
