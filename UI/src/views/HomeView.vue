<template>
	<div
		v-if="showUpdateNotice"
		class="card card-border min-h-[calc(100vh-var(--header-height)-1px)] bg-base-100"
	>
		<div class="card-body items-center justify-center text-center gap-6 px-6 py-10">
			<div class="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
				<span class="loading loading-spinner loading-lg"></span>
			</div>
			<div class="max-w-2xl space-y-3">
				<h1 class="text-2xl font-semibold text-base-content">Идёт обновление данных</h1>
				<p class="text-base text-base-content/80">
					{{ updateMessage }}
				</p>
				<p class="text-sm text-base-content/60">
					Страница проверяет готовность автоматически каждые 10 секунд.
				</p>
			</div>
			<div class="stats stats-vertical border border-base-300 shadow-sm sm:stats-horizontal">
				<div class="stat">
					<div class="stat-title">Статус</div>
					<div class="stat-value text-lg text-primary">{{ isPolling ? 'Обновляется' : 'Ожидание' }}</div>
				</div>
				<div class="stat" v-if="lastBuildCompletedAtLabel">
					<div class="stat-title">Последнее обновление</div>
					<div class="stat-value text-lg text-base-content">{{ lastBuildCompletedAtLabel }}</div>
				</div>
			</div>
		</div>
	</div>

	<div v-else class="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(26rem,1fr)] 2xl:grid-cols-[minmax(0,2fr)_minmax(30rem,1fr)]">
		<!-- table -->

		<div
			class="card card-border min-w-0 h-[calc(100vh-var(--header-height)-1px)] bg-base-100"
			id="table-view"
		>
			<div class="card-body h-full">
				<bonds-table
					v-model="bonds"
					:pagination-data="paginationData"
					:loading="isFetching"
					:sort-state="sortState"
					@update:sort-state="sortChanged"
					@update:page="pageChanged"
					@update:page-size="pageSizeChanged"
				/>
			</div>
		</div>

		<!-- filter -->

		<div
			class="card card-border min-w-0 h-[calc(100vh-var(--header-height)-1px)] bg-base-100"
		>
			<div class="card-body h-full">
				<bonds-filter
					v-model="filterSelections"
					:filter-options="filterOptions"
					@change="filterChanged"
				/>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import BondsRepository from "@/data/BondsRepository"
import { computed, onBeforeUnmount, ref } from "vue"
import { useStorage } from "@vueuse/core"

import CurrencyCollation from "@/data/collations/CurrencyCollation"
import CountryCollation from "@/data/collations/CountryCollation"
import type { CollationValueType } from "@/data/collations/BaseCollations"
import type { FilterOptions } from "@/data/Types/FilterOptions"
import { DefaultFilterSelections, defaultFilterValues } from "@/data/Types/FilterOptions"
import type { CombinedBondsResponse } from "@/data/Interfaces/CombinedBondsResponse"
import type { BondFilterOptionsResponse } from "@/data/Interfaces/BondList"
import type { BondsDataStatus } from "@/data/Interfaces/BondsDataStatus"
import type { sortState } from "@/data/Types/SortState"

const STATUS_POLL_INTERVAL_MS = 10_000

const createFilterSelections = (storedFilters: Partial<FilterOptions> | undefined): FilterOptions => ({
	...DefaultFilterSelections,
	...storedFilters,
	nominal: {
		...DefaultFilterSelections.nominal,
		...storedFilters?.nominal,
	},
	price: {
		...DefaultFilterSelections.price,
		...storedFilters?.price,
	},
	bondYield: {
		...DefaultFilterSelections.bondYield,
		...storedFilters?.bondYield,
	},
	duration: {
		...DefaultFilterSelections.duration,
		...storedFilters?.duration,
	},
})

export default {
	name: "HomeView",

	setup() {
		const bondsRepository = new BondsRepository()
		const filterSelectionsStore = useStorage<FilterOptions>(
			"filterSelections",
			DefaultFilterSelections
		)
		filterSelectionsStore.value = createFilterSelections(filterSelectionsStore.value)
		const sortState = useStorage<sortState>("sort-state", {
			prop: "name",
			order: "ascending"
		})

		const filterSelections = ref<FilterOptions>(createFilterSelections(filterSelectionsStore.value))

		const filterOptions = ref(defaultFilterValues)

		const isFetching = ref(false)
		const status = ref<BondsDataStatus | null>(null)
		const isPolling = ref(false)
		let statusPollTimer: ReturnType<typeof setTimeout> | undefined

		const bonds = ref<CombinedBondsResponse[]>([])

		const arrayOptions = ["classCode", "currency", "couponQuantityPerYear", "countryOfRisk"] as const
		type ArrayOptionKey = (typeof arrayOptions)[number]
		const paginationData = ref({
			total: 0,
			pageSize: useStorage<number>("pageSize", 20),
			currentPage: 1
		})

		const showUpdateNotice = computed(() => {
			if (isFetching.value) {
				return false
			}

			if (!status.value) {
				return true
			}

			return status.value.isBuilding || !status.value.hasCachedData
		})

		const updateMessage = computed(() => status.value?.message ?? "Идёт обновление данных, пожалуйста, подождите. Обычно это занимает не более 10 минут.")
		const lastBuildCompletedAtLabel = computed(() => {
			if (!status.value?.lastBuildCompletedAt) {
				return ""
			}

			return new Date(status.value.lastBuildCompletedAt).toLocaleString("ru-RU")
		})

		const clearStatusPoll = () => {
			if (statusPollTimer) {
				clearTimeout(statusPollTimer)
				statusPollTimer = undefined
			}
		}

		const scheduleStatusPoll = () => {
			clearStatusPoll()
			statusPollTimer = setTimeout(() => {
				void ensureDataReady()
			}, STATUS_POLL_INTERVAL_MS)
		}

		const ensureDataReady = async () => {
			isPolling.value = true
			try {
				status.value = await bondsRepository.status()
				if (status.value.isBuilding || !status.value.hasCachedData) {
					scheduleStatusPoll()
					return
				}

				clearStatusPoll()
				await Promise.all([fetchFilterOptions(), fetchBonds()])
			} finally {
				isPolling.value = false
			}
		}

		onBeforeUnmount(() => {
			clearStatusPoll()
		})

		const fetchBonds = async () => {
			isFetching.value = true
			try {
				const result = await bondsRepository.list({
					page: paginationData.value.currentPage,
					pageSize: paginationData.value.pageSize,
					sortProp: sortState.value.prop,
					sortOrder: sortState.value.order,
					filters: filterSelections.value,
				})

				bonds.value = result.items
				paginationData.value.total = result.total
			} finally {
				isFetching.value = false
			}
		}

		const isArrayOptionValue = (
			value: FilterOptions[ArrayOptionKey][number] | null | undefined,
		): value is FilterOptions[ArrayOptionKey][number] => value !== null && value !== undefined && value !== ""

		const sortChanged = (sort: sortState) => {
			sortState.value = sort
			void fetchBonds()
		}

		const fetchFilterOptions = async () => {
			const options = await bondsRepository.filterOptions()
			updateFilters(options)
		}

		const updateFilters = (optionsResponse: BondFilterOptionsResponse) => {
			for (const opt of arrayOptions) {
				let options = optionsResponse[opt] as Array<FilterOptions[ArrayOptionKey][number] | null | undefined>

				options = options
					.filter(isArrayOptionValue)
					.sort((a, b) => {
						if (a > b) return 1
						if (a < b) return -1
						return 0
					})

				filterOptions.value[opt] = [...new Set(options)].map((a) => {
					let label: CollationValueType = String(a)
					switch (opt) {
						case "currency":
							label = CurrencyCollation.getLabel(a as string)
							break
						case "countryOfRisk":
							label = CountryCollation.getLabel(a as string)
							break
					}
					return { value: a as string, label: label }
				})
			}
		}

		const filterChanged = () => {
			filterSelectionsStore.value = filterSelections.value
			paginationData.value.currentPage = 1
			void fetchBonds()
		}

		const pageChanged = (page: number) => {
			paginationData.value.currentPage = page
			void fetchBonds()
		}

		const pageSizeChanged = (pageSize: number) => {
			paginationData.value.pageSize = pageSize
			paginationData.value.currentPage = 1
			void fetchBonds()
		}

		return {
			bonds,
			isFetching,
			isPolling,
			showUpdateNotice,
			updateMessage,
			lastBuildCompletedAtLabel,
			filterOptions,
			filterSelections,
			paginationData,
			filterSelectionsStore,
			sortState,
			fetchBonds,
			sortChanged,
			filterChanged,
			pageChanged,
			pageSizeChanged,
			ensureDataReady
		}
	},
	//
	// data() {
	//   return {
	//     isFetching: this.isFetching
	//   }
	// },

	mounted() {
		this.ensureDataReady()
	}
}
</script>
