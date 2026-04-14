<template>
	<div class="flex h-full flex-col rounded-box border border-base-300 bg-base-100">
		<div class="relative flex-1 overflow-auto h-fit">
			<table class="table min-w-[2200px] table-auto text-left text-sm">
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
						<th class="px-3 py-3">
							<button type="button" class="font-semibold text-base-content" @click="toggleSort('name')">
								Название {{ sortIndicator('name') }}
							</button>
						</th>
						<th v-if="showAddButton" class="px-3 py-3 text-center text-base-content">+</th>
						<th class="px-3 py-3 font-semibold text-base-content">Тикер</th>
						<th class="px-3 py-3">
							<button type="button" class="font-semibold text-base-content" @click="toggleSort('duration')">
								Погашение {{ sortIndicator('duration') }}
							</button>
						</th>
						<th class="px-3 py-3">
							<button type="button" class="font-semibold text-base-content" @click="toggleSort('nominal')">
								Номинал {{ sortIndicator('nominal') }}
							</button>
						</th>
						<th class="px-3 py-3">
							<button type="button" class="font-semibold text-base-content" @click="toggleSort('price')">
								Цена {{ sortIndicator('price') }}
							</button>
						</th>
						<th class="px-3 py-3">
							<button
								type="button"
								class="font-semibold text-base-content"
								@click="toggleSort('couponsYield')"
							>
								∑ Купон за год {{ sortIndicator('couponsYield') }}
							</button>
						</th>
						<th class="px-3 py-3 font-semibold text-base-content">НКД</th>
						<th class="px-3 py-3">
							<button
								type="button"
								class="font-semibold text-base-content"
								@click="toggleSort('bondYield')"
							>
								Доходность {{ sortIndicator('bondYield') }}
							</button>
						</th>
						<th class="px-3 py-3">
							<button
								type="button"
								class="font-semibold text-base-content"
								@click="toggleSort('riskLevel')"
							>
								Уровень риска {{ sortIndicator('riskLevel') }}
							</button>
						</th>
						<th class="px-3 py-3 font-semibold text-base-content">Сектор</th>
						<th class="px-3 py-3 font-semibold text-base-content">Форма выпуска</th>
						<th class="px-3 py-3 font-semibold text-base-content">Ликвидность</th>
						<th class="px-3 py-3 font-semibold text-base-content">Биржа</th>
						<th class="min-w-[600px] px-3 py-3 font-semibold text-base-content">Свойства</th>
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
								class="btn btn-circle btn-sm border-base-300 bg-base-200 text-base-content/70 hover:bg-base-300"
								:disabled="store.getBondQty(row.uid) < 1"
								@click="store.decreaseQty(row.uid)"
							>
								−
							</button>
						</td>
						<td class="px-3 py-3">
							<div class="flex flex-wrap items-center gap-2">
								<span class="font-medium text-base-content">{{ row.name }}</span>
								<span
									v-if="store.getBondQty(row.uid) > 0"
									class="badge badge-neutral"
								>
									{{ store.getBondQty(row.uid) > 99 ? "99+" : store.getBondQty(row.uid) }}
								</span>
							</div>
						</td>
						<td v-if="showAddButton" class="px-3 py-3 text-center">
							<button
								type="button"
								class="btn btn-circle btn-sm border-base-300 bg-base-200 text-base-content hover:bg-base-300"
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
						<td class="px-3 py-3 text-base-content/80">
							{{ formatOptionalNumber(row.couponsYield) }} {{ CurrencyCollation.getLabel(row.currency) }}
						</td>
						<td class="px-3 py-3 text-base-content/80">
							{{ formatOptionalNumber(row.aciValue, 2) }} {{ CurrencyCollation.getLabel(row.currency) }}
						</td>
						<td class="px-3 py-3 text-base-content/80">{{ formatOptionalNumber(row.bondYield, 2) }}%</td>
						<td class="px-3 py-3"><risk-stars :level="row.riskLevel" /></td>
						<td class="px-3 py-3 text-base-content/80">{{ SectorsCollation.getLabel(row.sector) }}</td>
						<td class="px-3 py-3 text-base-content/80">{{ IssueKindCollations.getLabel(row.issueKind) }}</td>
						<td class="px-3 py-3"><liquidity-arrow :level="row.liquidity ?? 0" /></td>
						<td class="px-3 py-3 text-base-content/80">{{ ExchangeCollation.getLabel(String(row.realExchange)) }}</td>
						<td class="min-w-[600px] px-3 py-3"><bond-flags :row="row" :show="optionsToShow" /></td>
					</tr>
				</tbody>
			</table>
			<loading-overlay v-if="loading" />
		</div>

		<div class="flex flex-wrap items-center justify-between gap-3 border-t border-base-300 px-4 py-3">
			<div class="text-sm text-base-content/70">Всего: {{ paginationData.total }}</div>
			<div class="flex flex-wrap items-center gap-3">
				<label class="flex items-center gap-2 text-sm text-base-content/70">
					<span>На странице</span>
					<select
						class="select select-bordered select-sm"
						:value="paginationData.pageSize"
						@change="emit('update:page-size', Number(($event.target as HTMLSelectElement).value))"
					>
						<option v-for="size in pageSizes" :key="size" :value="size">{{ size }}</option>
					</select>
				</label>
				<div class="flex items-center gap-2">
					<button
						type="button"
						class="btn btn-outline btn-sm"
						:disabled="paginationData.currentPage <= 1"
						@click="emit('update:page', paginationData.currentPage - 1)"
					>
						Назад
					</button>
					<span class="text-sm text-base-content/70">
						{{ paginationData.currentPage }} / {{ totalPages }}
					</span>
					<button
						type="button"
						class="btn btn-outline btn-sm"
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
import type { CombinedBondsResponse } from "@/data/Interfaces/CombinedBondsResponse"
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
