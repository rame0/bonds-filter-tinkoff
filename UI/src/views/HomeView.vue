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
import type { FilterOptions, FromTo } from "@/data/Types/FilterOptions"
import { DefaultFilterSelections, defaultFilterValues } from "@/data/Types/FilterOptions"
import type { CombinedBondsResponse } from "@/data/Interfaces/CombinedBondsResponse"
import type { BondsDataStatus } from "@/data/Interfaces/BondsDataStatus"
import type { sortState } from "@/data/Types/SortState"

const STATUS_POLL_INTERVAL_MS = 10_000

export default {
	name: "HomeView",

	setup() {
		const bondsRepository = new BondsRepository()
		const filterSelectionsStore = useStorage<FilterOptions>(
			"filterSelections",
			DefaultFilterSelections
		)
		const sortState = useStorage<sortState>("sort-state", {
			prop: "name",
			order: "ascending"
		})

		const filterSelections = ref<FilterOptions>(filterSelectionsStore.value)

		const filterOptions = ref(defaultFilterValues)

		const response = ref<CombinedBondsResponse[]>([])
		const isFetching = ref(false)
		const status = ref<BondsDataStatus | null>(null)
		const isPolling = ref(false)
		let statusPollTimer: ReturnType<typeof setTimeout> | undefined

		const bonds = ref<CombinedBondsResponse[]>([])

		const arrayOptions = ["classCode", "currency", "couponQuantityPerYear", "countryOfRisk"] as const
		type ArrayOptionKey = (typeof arrayOptions)[number]
		type ComparableValue = string | number
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
				await fetchBonds()
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
				response.value = await bondsRepository.list()

				if (response.value) {
					updateFilters()
					updateTable()
				}
			} finally {
				isFetching.value = false
			}
		}

		const compareValues = (left: ComparableValue, right: ComparableValue, order: "ascending" | "descending") => {
			if (left > right) return order === "ascending" ? 1 : -1
			if (left < right) return order === "ascending" ? -1 : 1
			return 0
		}

		const isArrayOptionValue = (
			value: FilterOptions[ArrayOptionKey][number] | null | undefined
		): value is FilterOptions[ArrayOptionKey][number] => value !== null && value !== undefined && value !== ""

		const isRange = (
			value: unknown
		): value is {
			from: number
			to: number
		} =>
			value !== null &&
			typeof value === "object" &&
			Object.prototype.hasOwnProperty.call(value, "from") &&
			Object.prototype.hasOwnProperty.call(value, "to")

		const sortChanged = (sort: sortState) => {
			sortState.value = sort
			updateTable()
		}
		const updateTable = () => {
			isFetching.value = true
			const appliedFilters = Object.entries(filterSelections.value).filter(([, value]) => {
				if (value === undefined) {
					return false
				} else if (Array.isArray(value)) {
					return (value as []).length > 0
				} else if (isRange(value)) {
					return true
				} else if (typeof value === "string") {
					return value !== ""
				} else {
					return (value as number) >= 0
				}
			})

			const filtered = response.value.filter((bond) => {
				for (const [key, value] of appliedFilters) {
					if (key == "search") {
						const filterValue = value.toString().toLowerCase()
						const bondName = bond.name.toString().toLowerCase()
						const bondTicker = bond.ticker.toString().toLowerCase()
						const bondFigi = bond.figi.toString().toLowerCase()
						const bondIsin = bond.isin.toString().toLowerCase()

						if (
							!bondName.includes(filterValue) &&
							!bondTicker.includes(filterValue) &&
							!bondFigi.includes(filterValue) &&
							!bondIsin.includes(filterValue)
						) {
							return false
						}

						continue
					}
					const bondKeyValue = bond[key as keyof CombinedBondsResponse]
					if (
						key === "nominal" ||
						key === "placementPrice" ||
						key === "price" ||
						key === "yield" ||
						key === "bondYield" ||
						key == "duration"
					) {
						if (
							(bondKeyValue as number) < (value as FromTo).from ||
							(bondKeyValue as number) > (value as FromTo).to
						) {
							return false
						} else {
							continue
						}
					}
					if (value instanceof Array) {
						if (
							!(value as number[]).includes(+(bondKeyValue ?? 0)) &&
							!(value as string[]).includes(`${bondKeyValue}`)
						) {
							return false
						} else {
							continue
						}
					}
					if (value !== -1 && value != bondKeyValue) {
						return false
					}
				}
				return true
			})

			paginationData.value.total = filtered.length
			const start = (paginationData.value.currentPage - 1) * paginationData.value.pageSize
			const end = start + paginationData.value.pageSize

			const sorted = filtered.sort((a, b) => {
				const key = sortState.value.prop as keyof CombinedBondsResponse
				const order = sortState.value.order
				if (a[key] === undefined) return 1
				if (b[key] === undefined) return -1
				return compareValues(a[key] as ComparableValue, b[key] as ComparableValue, order)
			})

			bonds.value = sorted.slice(start, end)
			isFetching.value = false
		}

		const updateFilters = () => {
			for (const opt of arrayOptions) {
				let options = response.value.map((a) => a[opt]) as Array<FilterOptions[ArrayOptionKey][number] | null | undefined>

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
			updateTable()
		}

		const pageChanged = (page: number) => {
			paginationData.value.currentPage = page
			updateTable()
		}

		const pageSizeChanged = (pageSize: number) => {
			paginationData.value.pageSize = pageSize
			updateTable()
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
			updateTable,
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
