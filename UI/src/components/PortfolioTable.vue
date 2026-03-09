<template>
	<div class="flex h-full flex-col rounded-box border border-base-300 bg-base-100 shadow-sm">
		<div class="relative flex-1 overflow-auto">
			<table class="table table-zebra min-w-[1300px] table-auto text-left text-sm">
				<thead class="sticky top-0 z-10 bg-base-200">
					<tr>
						<th v-if="showAddButton" class="px-3 py-3 text-center">
							<button
								type="button"
								class="btn btn-circle btn-sm btn-outline btn-error"
								:disabled="store.isEmpty"
								title="Удалить все"
								@click="store.dropAllBonds()"
							>
								×
							</button>
						</th>
						<th class="px-3 py-3 font-semibold text-base-content">Название</th>
						<th v-if="showAddButton" class="px-3 py-3 text-center text-base-content">+</th>
						<th class="px-3 py-3 font-semibold text-base-content">Тикер</th>
						<th class="px-3 py-3 font-semibold text-base-content">Погашение</th>
						<th class="px-3 py-3 font-semibold text-base-content">Номинал</th>
						<th class="px-3 py-3 font-semibold text-base-content">Цена</th>
						<th class="px-3 py-3 font-semibold text-base-content">Доходность</th>
						<th class="px-3 py-3 font-semibold text-base-content">∑ Купон за год</th>
						<th class="px-3 py-3 font-semibold text-base-content">НКД</th>
						<th class="px-3 py-3 font-semibold text-base-content">Уровень риска</th>
						<th class="px-3 py-3 font-semibold text-base-content">Сектор</th>
						<th class="px-3 py-3 font-semibold text-base-content">Форма выпуска</th>
						<th class="px-3 py-3 font-semibold text-base-content">Ликвидность</th>
					</tr>
				</thead>
				<tbody>
					<tr
						v-for="row in modelValue"
						:key="row.uid"
						class="align-top"
					>
						<td v-if="showAddButton" class="px-3 py-3 text-center">
							<button
								type="button"
								class="btn btn-circle btn-sm btn-outline btn-error"
								:disabled="store.getBondQty(row.uid) < 1"
								@click="store.decreaseQty(row.uid)"
							>
								−
							</button>
						</td>
						<td class="px-3 py-3">
							<div class="flex flex-wrap items-center gap-2">
								<span class="font-medium text-base-content">{{ row.name }}</span>
								<span class="badge badge-primary">
									{{ row.qty > 99 ? "99+" : row.qty }}
								</span>
							</div>
						</td>
						<td v-if="showAddButton" class="px-3 py-3 text-center">
							<button
								type="button"
								class="btn btn-circle btn-sm btn-outline btn-primary"
								@click="store.increaseQty(row)"
							>
								+
							</button>
						</td>
						<td class="px-3 py-3"><links-to-exchange :ticker="row.ticker" :exchange="row.realExchange" /></td>
						<td class="px-3 py-3 text-base-content/80">{{ row.duration ?? "—" }} мес.</td>
						<td class="px-3 py-3 text-base-content/80">
							{{ formatOptionalNumber(row.nominal) }} {{ CurrencyCollation.getLabel(row.currency) }}
						</td>
						<td class="px-3 py-3 text-base-content/80">{{ formatOptionalNumber(row.price) }} %</td>
						<td class="px-3 py-3 text-base-content/80">{{ formatOptionalNumber(row.bondYield, 2) }}%</td>
						<td class="px-3 py-3 text-base-content/80">
							{{ formatOptionalNumber(row.couponsYield) }} {{ CurrencyCollation.getLabel(row.currency) }}
						</td>
						<td class="px-3 py-3 text-base-content/80">
							{{ formatOptionalNumber(row.aciValue, 2) }} {{ CurrencyCollation.getLabel(row.currency) }}
						</td>
						<td class="px-3 py-3"><risk-stars :level="row.riskLevel" /></td>
						<td class="px-3 py-3 text-base-content/80">{{ SectorsCollation.getLabel(row.sector) }}</td>
						<td class="px-3 py-3 text-base-content/80">{{ IssueKindCollations.getLabel(row.issueKind) }}</td>
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
import IssueKindCollations from "@/data/collations/IssueKindCollations"
import CurrencyCollation from "@/data/collations/CurrencyCollation"
import { portfolioStore } from "@/data/portfolioStore"
import type { CombinedBondsResponse } from "@/external/interfaces/CombinedBondsResponse"
import LiquidityArrow from "@/components/UI/LiquidityArrow.vue"
import LinksToExchange from "@/components/UI/LinksToExchange.vue"
import LoadingOverlay from "@/components/UI/LoadingOverlay.vue"
import RiskStars from "@/components/UI/RiskStars.vue"

defineProps({
	modelValue: {
		type: Array as PropType<CombinedBondsResponse[]>,
		required: true
	},
	loading: Boolean,
	showAddButton: {
		type: Boolean,
		default: true
	}
})

const store = portfolioStore()

const formatOptionalNumber = (value?: number, digits?: number) => {
	if (value === undefined || value === null || Number.isNaN(value)) {
		return "—"
	}

	return digits === undefined ? value : value.toFixed(digits)
}
</script>
