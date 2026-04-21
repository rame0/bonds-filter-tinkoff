<template>
	<div class="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(24rem,1fr)] 2xl:grid-cols-[minmax(0,2fr)_minmax(28rem,1fr)]">
		<!-- table -->

		<div
			class="card card-border min-w-0 h-[calc(100vh-var(--header-height)-1px)] bg-base-100"
			id="table-view"
		>
			<div class="card-body h-full">
				<portfolio-table :rows="portfolioRows" :loading="isFetching" />
			</div>
		</div>

		<!-- stats -->

		<div
			class="card card-border min-w-0 h-[calc(100vh-var(--header-height)-1px)] bg-base-100"
		>
			<div class="card-body h-full overflow-hidden">
				<portfolio-stats :metrics="portfolioMetrics" :loading="isFetching" />
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
		const isFetching = ref(false)
		const store = portfolioStore()
		const portfolioPositions = computed<PortfolioPositionInput[]>(() => store.positions)
		const portfolioMetrics = ref<PortfolioMetricsResponse | null>(null)
		const portfolioRows = ref<PortfolioTableRow[]>([])
		const bondsRepository = new BondsRepository()

		const fetchPortfolioData = async (positions: PortfolioPositionInput[]) => {
			if (positions.length < 1) {
				portfolioMetrics.value = null
				portfolioRows.value = []
				isFetching.value = false
				return
			}

			isFetching.value = true
			try {
				const [metrics, table] = await Promise.all([
					bondsRepository.portfolioMetrics(positions),
					bondsRepository.portfolioTable(positions)
				])

				portfolioMetrics.value = metrics
				portfolioRows.value = table.rows
			} finally {
				isFetching.value = false
			}
		}

		watch(
			portfolioPositions,
			(positions) => {
				void fetchPortfolioData(positions)
			},
			{ deep: true, immediate: true }
		)

		return {
			portfolioRows,
			portfolioMetrics,
			isFetching
		}
	}
}
</script>
