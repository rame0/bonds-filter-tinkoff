<template>
	<div class="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(26rem,1fr)] 2xl:grid-cols-[minmax(0,2fr)_minmax(30rem,1fr)]">
		<!-- table -->

		<div
			class="card card-border min-w-0 h-[calc(100vh-var(--header-height)-1px)] bg-base-100"
			id="table-view"
		>
			<div class="card-body p-4">
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
			<div class="card-body p-4">
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
import { ref } from "vue"
import { useStorage } from "@vueuse/core"

import CurrencyCollation from "@/data/collations/CurrencyCollation"
import CountryCollation from "@/data/collations/CountryCollation"
import type { FilterOptions, FilterValues, FromTo } from "@/data/Types/FilterOptions"
import { DefaultFilterSelections, defaultFilterValues } from "@/data/Types/FilterOptions"
//@ts-ignore
import { type CombinedBondsResponse } from "@/external/interfaces/CombinedBondsResponse"
import type { sortState } from "@/data/Types/SortState"

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

		const bonds = ref<CombinedBondsResponse[]>([])

		const arrayOptions = ["classCode", "currency", "couponQuantityPerYear", "countryOfRisk"]
		const paginationData = ref({
			total: 0,
			pageSize: useStorage<number>("pageSize", 20),
			currentPage: 1
		})

		const fetchBonds = async () => {
			isFetching.value = true
			response.value = await bondsRepository.list()

			if (response.value) {
				updateFilters()
				updateTable()
			}

			isFetching.value = false
		}

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
				// @ts-ignore
				if (a[key] > b[key]) return order === "ascending" ? 1 : -1
				// @ts-ignore
				if (a[key] < b[key]) return order === "ascending" ? -1 : 1
				return 0
			})

			bonds.value = sorted.slice(start, end)
			isFetching.value = false
		}

		const updateFilters = () => {
			for (const opt of arrayOptions) {
				let options = response.value.map((a) => a[opt as keyof CombinedBondsResponse])

				options = options
					.filter((a) => a !== null && a !== undefined && a !== "")
					.sort((a, b) => {
						if (a === undefined || b === undefined) return 0
						if (a > b) return 1
						if (a < b) return -1
						return 0
					})

				// @ts-ignore
				filterOptions.value[opt as keyof FilterValues] = [...new Set(options)].map((a) => {
					let label = a
					switch (opt) {
						case "currency":
							// @ts-ignore
							label = CurrencyCollation.getLabel(a as string)
							break
						case "countryOfRisk":
							// @ts-ignore
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
			pageSizeChanged
		}
	},
	//
	// data() {
	//   return {
	//     isFetching: this.isFetching
	//   }
	// },

	mounted() {
		this.fetchBonds()
	}
}
</script>
