<template>
	<div class="flex h-full flex-col rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
		<div class="relative flex-1 overflow-auto">
			<table class="min-w-[1300px] w-full table-auto text-left text-sm">
				<thead class="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900">
					<tr class="border-b border-slate-200 dark:border-slate-800">
						<th v-if="showAddButton" class="px-3 py-3 text-center">
							<button
								type="button"
								class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-rose-300 text-lg font-bold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/40"
								:disabled="store.isEmpty"
								title="Удалить все"
								@click="store.dropAllBonds()"
							>
								×
							</button>
						</th>
						<th class="px-3 py-3 font-semibold text-slate-700 dark:text-slate-200">Название</th>
						<th v-if="showAddButton" class="px-3 py-3 text-center text-slate-700 dark:text-slate-200">+</th>
						<th class="px-3 py-3 font-semibold text-slate-700 dark:text-slate-200">Тикер</th>
						<th class="px-3 py-3 font-semibold text-slate-700 dark:text-slate-200">Погашение</th>
						<th class="px-3 py-3 font-semibold text-slate-700 dark:text-slate-200">Номинал</th>
						<th class="px-3 py-3 font-semibold text-slate-700 dark:text-slate-200">Цена</th>
						<th class="px-3 py-3 font-semibold text-slate-700 dark:text-slate-200">Доходность</th>
						<th class="px-3 py-3 font-semibold text-slate-700 dark:text-slate-200">∑ Купон за год</th>
						<th class="px-3 py-3 font-semibold text-slate-700 dark:text-slate-200">НКД</th>
						<th class="px-3 py-3 font-semibold text-slate-700 dark:text-slate-200">Уровень риска</th>
						<th class="px-3 py-3 font-semibold text-slate-700 dark:text-slate-200">Сектор</th>
						<th class="px-3 py-3 font-semibold text-slate-700 dark:text-slate-200">Форма выпуска</th>
						<th class="px-3 py-3 font-semibold text-slate-700 dark:text-slate-200">Ликвидность</th>
					</tr>
				</thead>
				<tbody>
					<tr
						v-for="row in modelValue"
						:key="row.uid"
						class="border-b border-slate-100 align-top last:border-b-0 dark:border-slate-900"
					>
						<td v-if="showAddButton" class="px-3 py-3 text-center">
							<button
								type="button"
								class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-rose-300 text-lg font-bold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/40"
								:disabled="store.getBondQty(row.uid) < 1"
								@click="store.decreaseQty(row.uid)"
							>
								−
							</button>
						</td>
						<td class="px-3 py-3">
							<div class="flex flex-wrap items-center gap-2">
								<span class="font-medium text-slate-900 dark:text-slate-100">{{ row.name }}</span>
								<span class="rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-semibold text-white">
									{{ row.qty > 99 ? "99+" : row.qty }}
								</span>
							</div>
						</td>
						<td v-if="showAddButton" class="px-3 py-3 text-center">
							<button
								type="button"
								class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-emerald-300 text-lg font-bold text-emerald-600 transition hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
								@click="store.increaseQty(row)"
							>
								+
							</button>
						</td>
						<td class="px-3 py-3"><links-to-exchange :ticker="row.ticker" :exchange="row.realExchange" /></td>
						<td class="px-3 py-3 text-slate-700 dark:text-slate-200">{{ row.duration ?? "—" }} мес.</td>
						<td class="px-3 py-3 text-slate-700 dark:text-slate-200">
							{{ formatOptionalNumber(row.nominal) }} {{ CurrencyCollation.getLabel(row.currency) }}
						</td>
						<td class="px-3 py-3 text-slate-700 dark:text-slate-200">{{ formatOptionalNumber(row.price) }} %</td>
						<td class="px-3 py-3 text-slate-700 dark:text-slate-200">{{ formatOptionalNumber(row.bondYield, 2) }}%</td>
						<td class="px-3 py-3 text-slate-700 dark:text-slate-200">
							{{ formatOptionalNumber(row.couponsYield) }} {{ CurrencyCollation.getLabel(row.currency) }}
						</td>
						<td class="px-3 py-3 text-slate-700 dark:text-slate-200">
							{{ formatOptionalNumber(row.aciValue, 2) }} {{ CurrencyCollation.getLabel(row.currency) }}
						</td>
						<td class="px-3 py-3"><risk-stars :level="row.riskLevel" /></td>
						<td class="px-3 py-3 text-slate-700 dark:text-slate-200">{{ SectorsCollation.getLabel(row.sector) }}</td>
						<td class="px-3 py-3 text-slate-700 dark:text-slate-200">{{ IssueKindCollations.getLabel(row.issueKind) }}</td>
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
