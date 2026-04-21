<template>
	<div class="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(24rem,1fr)] 2xl:grid-cols-[minmax(0,2fr)_minmax(28rem,1fr)]">
		<!-- table -->

		<div
			class="card card-border min-w-0 h-[calc(100vh-var(--header-height)-1px)] bg-base-100"
			id="table-view"
		>
			<div class="card-body h-full">
				<portfolio-table :rows="portfolioRows" :loading="isFetchingTable" />
			</div>
		</div>

		<!-- stats -->

		<div
			class="card card-border min-w-0 h-[calc(100vh-var(--header-height)-1px)] bg-base-100"
		>
			<div class="card-body h-full overflow-hidden">
				<portfolio-stats :metrics="portfolioMetrics" :loading="isFetchingMetrics" />
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { portfolioStore } from "@/data/portfolioStore"
import { ref, computed, watch } from "vue"
import BondsRepository from "@/data/BondsRepository"
import type { PortfolioMetricsResponse, PortfolioPositionInput } from "@/data/Interfaces/PortfolioMetrics"
import type { PortfolioTableRow } from "@/data/Interfaces/PortfolioTable"

export default {
	name: "PortfolioView",
	setup() {
		const isFetchingMetrics = ref(false)
		const isFetchingTable = ref(false)
		const store = portfolioStore()
		const portfolioPositions = computed<PortfolioPositionInput[]>(() => store.positions)
		const portfolioMetrics = ref<PortfolioMetricsResponse | null>(null)
		const portfolioRows = ref<PortfolioTableRow[]>([])
		const bondsRepository = new BondsRepository()
		let metricsRequestId = 0
		let tableRequestId = 0

		const fetchPortfolioMetrics = async (positions: PortfolioPositionInput[]) => {
			if (positions.length < 1) {
				portfolioMetrics.value = null
				return
			}

			const requestId = ++metricsRequestId
			isFetchingMetrics.value = true
			try {
				const metrics = await bondsRepository.portfolioMetrics(positions)
				if (requestId === metricsRequestId) {
					portfolioMetrics.value = metrics
				}
			} finally {
				if (requestId === metricsRequestId) {
					isFetchingMetrics.value = false
				}
			}
		}

		const fetchPortfolioTable = async (positions: PortfolioPositionInput[]) => {
			if (positions.length < 1) {
				portfolioRows.value = []
				return
			}

			const requestId = ++tableRequestId
			isFetchingTable.value = true
			try {
				const table = await bondsRepository.portfolioTable(positions)
				if (requestId === tableRequestId) {
					portfolioRows.value = table.rows
				}
			} finally {
				if (requestId === tableRequestId) {
					isFetchingTable.value = false
				}
			}
		}

		const syncRowQuantities = (positions: PortfolioPositionInput[]) => {
			const qtyByUid = new Map(positions.map(position => [position.uid, position.qty]))
			portfolioRows.value = portfolioRows.value.map(row => {
				const qty = qtyByUid.get(row.uid)
				if (qty === undefined || qty === row.qty) {
					return row
				}

				return {
					...row,
					qty,
					positionCost: row.fullPrice !== undefined ? Number((qty * row.fullPrice).toFixed(2)) : row.positionCost
				}
			})
		}

		const hasSamePositionSet = (next: PortfolioPositionInput[], prev: PortfolioPositionInput[]) => {
			if (next.length !== prev.length) {
				return false
			}

			const prevUids = new Set(prev.map(position => position.uid))
			return next.every(position => prevUids.has(position.uid))
		}

		watch(
			portfolioPositions,
			(positions, previousPositions = []) => {
				void fetchPortfolioMetrics(positions)

				if (hasSamePositionSet(positions, previousPositions)) {
					syncRowQuantities(positions)
					return
				}

				void fetchPortfolioTable(positions)
			},
			{ deep: true, immediate: true }
		)

		return {
			portfolioRows,
			portfolioMetrics,
			isFetchingMetrics,
			isFetchingTable
		}
	}
}
</script>
