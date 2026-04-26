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
							<td class="py-3 pr-4 font-medium">Сумма при погашении:</td>
							<td class="py-3 text-right">{{ formatMoney(metrics.totals.maturityValueRub) }}</td>
						</tr>
						<tr>
							<td class="py-3 pr-4 font-medium">Прибыль при погашении, % к покупке:</td>
							<td class="py-3 text-right">{{ formatPercent(metrics.totals.maturityValuePct) }}</td>
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

			<div class="rounded-box border border-base-300 bg-base-100 p-4">
				<div class="flex flex-wrap items-start justify-between gap-3">
					<div>
						<h3 class="text-base font-semibold text-base-content">Риск-профиль портфеля</h3>
						<p class="text-sm text-base-content/70">Сводный риск по доминирующей доле текущей стоимости.</p>
					</div>
					<span class="badge badge-lg border-0 text-white" :class="riskBadgeClass(metrics.riskProfile.items[0]?.riskLevel ?? 0)">
						{{ metrics.riskProfile.summary }}
					</span>
				</div>

				<div v-if="metrics.riskProfile.items.length < 1" class="mt-4 rounded-box bg-base-200 px-4 py-6 text-sm text-base-content/70">
					Нет данных по риск-профилю.
				</div>

				<div v-else class="mt-4 space-y-2">
					<div
						v-for="item in metrics.riskProfile.items"
						:key="item.riskLevel"
						class="flex items-start justify-between gap-3 rounded-box bg-base-200 px-3 py-2 text-sm"
					>
						<div class="flex items-center gap-2">
							<span class="h-3 w-3 rounded-full" :class="riskDotClass(item.riskLevel)"></span>
							<span>{{ item.label }}</span>
						</div>
						<div class="shrink-0 text-right">
							<div class="font-medium text-base-content">{{ formatMoney(item.amountRub) }}</div>
							<div class="text-xs text-base-content/70">{{ formatPercent(item.sharePct) }}</div>
						</div>
					</div>
				</div>
			</div>

			<PortfolioCouponChart :items="metrics.couponSchedule" />
			<PortfolioSectorChart :items="metrics.sectorAllocation" />
		</template>
	</div>
</template>

<script lang="ts" setup>
import { defineAsyncComponent, type PropType } from "vue"
import LoadingOverlay from "@/components/UI/LoadingOverlay.vue"
import type { PortfolioMetricsResponse } from "@/data/Interfaces/PortfolioMetrics"
import { formatDateTime, formatInteger, formatMoney, formatPercent } from "@/utils/format"

const PortfolioCouponChart = defineAsyncComponent(() => import("@/components/PortfolioCouponChart.vue"))
const PortfolioSectorChart = defineAsyncComponent(() => import("@/components/PortfolioSectorChart.vue"))

const riskBadgeClass = (riskLevel: number) => {
	switch (riskLevel) {
		case 1:
			return "bg-success"
		case 2:
			return "bg-warning text-base-100"
		case 3:
			return "bg-error"
		default:
			return "bg-neutral"
	}
}

const riskDotClass = (riskLevel: number) => {
	switch (riskLevel) {
		case 1:
			return "bg-success"
		case 2:
			return "bg-warning"
		case 3:
			return "bg-error"
		default:
			return "bg-neutral"
	}
}

defineProps({
	metrics: {
		type: Object as PropType<PortfolioMetricsResponse | null>,
		default: null,
	},
	loading: Boolean,
})
</script>
