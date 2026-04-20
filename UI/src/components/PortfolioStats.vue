<template>
	<div class="relative flex h-full flex-col gap-4 overflow-auto">
		<div v-if="loading" class="absolute inset-0 z-10">
			<loading-overlay />
		</div>

		<div v-if="!metrics" class="rounded-box border border-base-300 bg-base-100 p-5 text-sm text-base-content/70">
			Портфель пуст или данные ещё не рассчитаны.
		</div>

		<template v-else>
			<div class="rounded-box border border-base-300 bg-base-100 p-4">
				<table class="table table-zebra w-full text-sm">
					<tbody>
						<tr>
							<td class="py-3 pr-4 font-medium">Всего бумаг:</td>
							<td class="py-3 text-right">{{ formatInteger(metrics.totals.totalBonds) }}</td>
						</tr>
						<tr>
							<td class="py-3 pr-4 font-medium">Всего купонов:</td>
							<td class="py-3 text-right">{{ formatInteger(metrics.totals.totalCoupons) }}</td>
						</tr>
						<tr>
							<td class="py-3 pr-4 font-medium">Профит от купонов:</td>
							<td class="py-3 text-right">{{ formatMoney(metrics.totals.couponProfitRub) }}</td>
						</tr>
						<tr>
							<td class="py-3 pr-4 font-medium">Цена покупки портфеля:</td>
							<td class="py-3 text-right">{{ formatMoney(metrics.totals.purchaseCostRub) }}</td>
						</tr>
						<tr>
							<td class="py-3 pr-4 font-medium">Профит при погашении:</td>
							<td class="py-3 text-right">{{ formatMoney(metrics.totals.maturityProfitRub) }}</td>
						</tr>
						<tr>
							<td class="py-3 pr-4 font-medium">Профит при погашении, %:</td>
							<td class="py-3 text-right">{{ formatPercent(metrics.totals.maturityProfitPct) }}</td>
						</tr>
					</tbody>
				</table>

				<div class="mt-4 grid gap-2 rounded-box bg-base-200 p-3 text-xs text-base-content/70">
					<div>Данные облигаций: {{ formatDateTime(metrics.actuality.bondsUpdatedAt) }}</div>
					<div>Курсы ЦБ обновлены: {{ formatDateTime(metrics.actuality.ratesUpdatedAt) }}</div>
					<div>Дата курсов ЦБ: {{ metrics.actuality.ratesDate }}</div>
					<div>Портфель рассчитан: {{ formatDateTime(metrics.actuality.generatedAt) }}</div>
				</div>
			</div>

			<portfolio-coupon-chart :items="metrics.couponSchedule" />
			<portfolio-sector-chart :items="metrics.sectorAllocation" />
		</template>
	</div>
</template>

<script lang="ts" setup>
import type { PropType } from "vue"
import LoadingOverlay from "@/components/UI/LoadingOverlay.vue"
import type { PortfolioMetricsResponse } from "@/data/Interfaces/PortfolioMetrics"
import { formatDateTime, formatInteger, formatMoney, formatPercent } from "@/utils/format"

defineProps({
	metrics: {
		type: Object as PropType<PortfolioMetricsResponse | null>,
		default: null
	},
	loading: Boolean
})
</script>
