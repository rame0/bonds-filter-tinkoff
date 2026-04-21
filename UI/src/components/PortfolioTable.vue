<template>
	<div class="flex h-full flex-col rounded-box border border-base-300 bg-base-100">
		<div class="relative flex-1 overflow-auto">
			<table class="table min-w-[1700px] table-auto text-left text-sm">
				<thead class="sticky top-0 z-10 bg-base-200/95 backdrop-blur">
					<tr>
						<th v-if="showAddButton" class="px-3 py-3 text-center">
							<button
								type="button"
								class="btn btn-circle btn-sm border-base-300 bg-base-200 text-error hover:bg-base-300"
								:disabled="store.isEmpty"
								title="Удалить все"
								@click="store.dropAllBonds()"
							>
								×
							</button>
						</th>
						<th class="px-3 py-3 font-semibold text-base-content">Бумага</th>
						<th v-if="showAddButton" class="px-3 py-3 text-center text-base-content">+</th>
						<th class="px-3 py-3 font-semibold text-base-content">Кол-во</th>
						<th class="px-3 py-3 font-semibold text-base-content">Погашение / Оферта</th>
						<th class="px-3 py-3 font-semibold text-base-content">Цена % / Полная цена</th>
						<th class="px-3 py-3 font-semibold text-base-content">Стоимость позиции</th>
						<th class="px-3 py-3 font-semibold text-base-content">Доходность</th>
						<th class="px-3 py-3 font-semibold text-base-content">Купон</th>
						<th class="px-3 py-3 font-semibold text-base-content">Месяца выплаты купонов</th>
						<th class="px-3 py-3 font-semibold text-base-content">Сектор</th>
						<th class="px-3 py-3 font-semibold text-base-content">Риск</th>
						<th class="px-3 py-3 font-semibold text-base-content">Ликвидность</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="row in rows" :key="row.uid" class="align-top">
						<td v-if="showAddButton" class="px-3 py-3 text-center">
							<button
								type="button"
								class="btn btn-circle btn-sm border-base-300 bg-base-200 text-base-content/70 hover:bg-base-300"
								:disabled="store.getBondQty(row.uid) < 1"
								@click="store.decreaseQty(row.uid)"
							>
								−
							</button>
						</td>
						<td class="px-3 py-3">
							<div class="min-w-[16rem] space-y-1">
								<div class="font-medium text-base-content">{{ row.name }}</div>
								<div class="text-xs uppercase tracking-wide text-base-content/60">{{ row.ticker }}</div>
							</div>
						</td>
						<td v-if="showAddButton" class="px-3 py-3 text-center">
							<button
								type="button"
								class="btn btn-circle btn-sm border-base-300 bg-base-200 text-base-content hover:bg-base-300"
								@click="store.increaseQty(row.uid)"
							>
								+
							</button>
						</td>
						<td class="px-3 py-3 text-base-content/80">{{ formatInteger(row.qty) }}</td>
						<td class="px-3 py-3 text-base-content/80">{{ formatDate(row.displayDate) }}</td>
						<td class="px-3 py-3"><portfolio-price-cell :row="row" /></td>
						<td class="px-3 py-3 text-base-content/80">{{ formatMoney(row.positionCost, row.currency) }}</td>
						<td class="px-3 py-3 text-base-content/80">{{ formatPercent(row.bondYield) }}</td>
						<td class="px-3 py-3"><portfolio-coupon-cell :row="row" /></td>
						<td class="px-3 py-3"><portfolio-coupon-months :active-months="row.couponMonths" /></td>
						<td class="px-3 py-3 text-base-content/80">{{ SectorsCollation.getLabel(row.sector) }}</td>
						<td class="px-3 py-3"><risk-stars :level="row.riskLevel" /></td>
						<td class="px-3 py-3"><liquidity-arrow :level="row.liquidity ?? 0" /></td>
					</tr>
				</tbody>
			</table>
			<loading-overlay v-if="loading" />
		</div>
	</div>
</template>

<script lang="ts" setup>
import { type PropType } from "vue"
import SectorsCollation from "@/data/collations/SectorsCollation"
import { portfolioStore } from "@/data/portfolioStore"
import type { PortfolioTableRow } from "@/data/Interfaces/PortfolioTable"
import LiquidityArrow from "@/components/UI/LiquidityArrow.vue"
import LoadingOverlay from "@/components/UI/LoadingOverlay.vue"
import RiskStars from "@/components/UI/RiskStars.vue"
import PortfolioCouponCell from "@/components/PortfolioCouponCell.vue"
import PortfolioCouponMonths from "@/components/PortfolioCouponMonths.vue"
import PortfolioPriceCell from "@/components/PortfolioPriceCell.vue"
import { formatDate, formatInteger, formatMoney, formatPercent } from "@/utils/format"

defineProps({
	rows: {
		type: Array as PropType<PortfolioTableRow[]>,
		required: true
	},
	loading: Boolean,
	showAddButton: {
		type: Boolean,
		default: true
	}
})

const store = portfolioStore()
</script>
