<template>
	<div class="flex h-full flex-col rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
		<div class="relative flex-1 overflow-auto">
			<table class="min-w-[1700px] w-full table-auto text-left text-sm">
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
						<th class="px-3 py-3">
							<button type="button" class="font-semibold text-slate-700 dark:text-slate-200" @click="toggleSort('name')">
								Название {{ sortIndicator('name') }}
							</button>
						</th>
						<th v-if="showAddButton" class="px-3 py-3 text-center text-slate-700 dark:text-slate-200">+</th>
						<th class="px-3 py-3 font-semibold text-slate-700 dark:text-slate-200">Тикер</th>
						<th class="px-3 py-3">
							<button type="button" class="font-semibold text-slate-700 dark:text-slate-200" @click="toggleSort('duration')">
								Погашение {{ sortIndicator('duration') }}
							</button>
						</th>
						<th class="px-3 py-3">
							<button type="button" class="font-semibold text-slate-700 dark:text-slate-200" @click="toggleSort('nominal')">
								Номинал {{ sortIndicator('nominal') }}
							</button>
						</th>
						<th class="px-3 py-3">
							<button type="button" class="font-semibold text-slate-700 dark:text-slate-200" @click="toggleSort('price')">
								Цена {{ sortIndicator('price') }}
							</button>
						</th>
						<th class="px-3 py-3">
							<button
								type="button"
								class="font-semibold text-slate-700 dark:text-slate-200"
								@click="toggleSort('couponsYield')"
							>
								∑ Купон за год {{ sortIndicator('couponsYield') }}
							</button>
						</th>
						<th class="px-3 py-3 font-semibold text-slate-700 dark:text-slate-200">НКД</th>
						<th class="px-3 py-3">
							<button
								type="button"
								class="font-semibold text-slate-700 dark:text-slate-200"
								@click="toggleSort('bondYield')"
							>
								Доходность {{ sortIndicator('bondYield') }}
							</button>
						</th>
						<th class="px-3 py-3">
							<button
								type="button"
								class="font-semibold text-slate-700 dark:text-slate-200"
								@click="toggleSort('riskLevel')"
							>
								Уровень риска {{ sortIndicator('riskLevel') }}
							</button>
						</th>
						<th class="px-3 py-3 font-semibold text-slate-700 dark:text-slate-200">Сектор</th>
						<th class="px-3 py-3 font-semibold text-slate-700 dark:text-slate-200">Форма выпуска</th>
						<th class="px-3 py-3 font-semibold text-slate-700 dark:text-slate-200">Ликвидность</th>
						<th class="px-3 py-3 font-semibold text-slate-700 dark:text-slate-200">Биржа</th>
						<th class="px-3 py-3 font-semibold text-slate-700 dark:text-slate-200">Свойства</th>
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
								<span
									v-if="store.getBondQty(row.uid) > 0"
									class="rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-semibold text-white"
								>
									{{ store.getBondQty(row.uid) > 99 ? "99+" : store.getBondQty(row.uid) }}
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
						<td class="px-3 py-3 text-slate-700 dark:text-slate-200">
							{{ formatOptionalNumber(row.couponsYield) }} {{ CurrencyCollation.getLabel(row.currency) }}
						</td>
						<td class="px-3 py-3 text-slate-700 dark:text-slate-200">
							{{ formatOptionalNumber(row.aciValue, 2) }} {{ CurrencyCollation.getLabel(row.currency) }}
						</td>
						<td class="px-3 py-3 text-slate-700 dark:text-slate-200">{{ formatOptionalNumber(row.bondYield, 2) }}%</td>
						<td class="px-3 py-3"><risk-stars :level="row.riskLevel" /></td>
						<td class="px-3 py-3 text-slate-700 dark:text-slate-200">{{ SectorsCollation.getLabel(row.sector) }}</td>
						<td class="px-3 py-3 text-slate-700 dark:text-slate-200">{{ IssueKindCollations.getLabel(row.issueKind) }}</td>
						<td class="px-3 py-3"><liquidity-arrow :level="row.liquidity ?? 0" /></td>
						<td class="px-3 py-3 text-slate-700 dark:text-slate-200">{{ ExchangeCollation.getLabel(String(row.realExchange)) }}</td>
						<td class="px-3 py-3"><bond-flags :row="row" :show="optionsToShow" /></td>
					</tr>
				</tbody>
			</table>
			<loading-overlay v-if="loading" />
		</div>

		<div class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 dark:border-slate-800">
			<div class="text-sm text-slate-600 dark:text-slate-300">Всего: {{ paginationData.total }}</div>
			<div class="flex flex-wrap items-center gap-3">
				<label class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
					<span>На странице</span>
					<select
						class="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
						:value="paginationData.pageSize"
						@change="emit('update:page-size', Number(($event.target as HTMLSelectElement).value))"
					>
						<option v-for="size in pageSizes" :key="size" :value="size">{{ size }}</option>
					</select>
				</label>
				<div class="flex items-center gap-2">
					<button
						type="button"
						class="rounded-lg border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 transition hover:border-emerald-500 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200"
						:disabled="paginationData.currentPage <= 1"
						@click="emit('update:page', paginationData.currentPage - 1)"
					>
						Назад
					</button>
					<span class="text-sm text-slate-600 dark:text-slate-300">
						{{ paginationData.currentPage }} / {{ totalPages }}
					</span>
					<button
						type="button"
						class="rounded-lg border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 transition hover:border-emerald-500 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200"
						:disabled="paginationData.currentPage >= totalPages"
						@click="emit('update:page', paginationData.currentPage + 1)"
					>
						Вперёд
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { computed, type PropType } from "vue"
import SectorsCollation from "@/data/collations/SectorsCollation"
import IssueKindCollations from "@/data/collations/IssueKindCollations"
import ExchangeCollation from "@/data/collations/ExchangeCollation"
import CurrencyCollation from "@/data/collations/CurrencyCollation"
import { portfolioStore } from "@/data/portfolioStore"
import type { sortState } from "@/data/Types/SortState"
import type { CombinedBondsResponse } from "@/external/interfaces/CombinedBondsResponse"
import BondFlags from "@/components/UI/BondFlags.vue"
import LiquidityArrow from "@/components/UI/LiquidityArrow.vue"
import LinksToExchange from "@/components/UI/LinksToExchange.vue"
import LoadingOverlay from "@/components/UI/LoadingOverlay.vue"
import RiskStars from "@/components/UI/RiskStars.vue"

type PaginationData = {
	total: number
	pageSize: number
	currentPage: number
}

const props = defineProps({
	modelValue: {
		type: Array as PropType<CombinedBondsResponse[]>,
		required: true
	},
	loading: Boolean,
	paginationData: {
		type: Object as PropType<PaginationData>,
		required: true
	},
	sortState: {
		type: Object as PropType<sortState>,
		required: true
	},
	showAddButton: {
		type: Boolean,
		default: true
	}
})

const emit = defineEmits<{
	(e: "update:sortState", value: sortState): void
	(e: "update:page", value: number): void
	(e: "update:page-size", value: number): void
}>()

const store = portfolioStore()
const pageSizes = [20, 50, 100]
const optionsToShow = [
	"forIisFlag",
	"forQualInvestorFlag",
	"floatingCouponFlag",
	"amortizationFlag",
	"otcFlag",
	"buyAvailableFlag",
	"sellAvailableFlag",
	"perpetualFlag",
	"weekendFlag",
	"subordinatedFlag"
]

const totalPages = computed(() =>
	Math.max(1, Math.ceil(props.paginationData.total / Math.max(1, Number(props.paginationData.pageSize))))
)

const toggleSort = (prop: string) => {
	const nextOrder =
		props.sortState.prop === prop && props.sortState.order === "ascending"
			? "descending"
			: "ascending"

	emit("update:sortState", { prop, order: nextOrder })
}

const sortIndicator = (prop: string) => {
	if (props.sortState.prop !== prop) return ""
	return props.sortState.order === "ascending" ? "↑" : "↓"
}

const formatOptionalNumber = (value?: number, digits?: number) => {
	if (value === undefined || value === null || Number.isNaN(value)) {
		return "—"
	}

	return digits === undefined ? value : value.toFixed(digits)
}
</script>
