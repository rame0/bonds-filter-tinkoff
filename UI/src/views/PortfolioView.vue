<template>
	<div class="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(20rem,1fr)]">
		<!-- table -->

		<div
			class="card min-w-0 h-[calc(100vh-var(--header-height)-1px)] border border-base-300 bg-base-100 p-5 shadow-sm"
			id="table-view"
		>
			<portfolio-table v-model="portfolioBonds" :loading="isFetching" />
		</div>

		<!-- stats -->

		<div
			class="card min-w-0 h-[calc(100vh-var(--header-height)-1px)] border border-base-300 bg-base-100 p-5 shadow-sm"
		>
			<portfolio-stats v-model="portfolioBonds" :loading="isFetching" />
		</div>
	</div>
</template>

<script lang="ts">
import { portfolioStore } from "@/data/portfolioStore"
import { onMounted, ref, computed } from "vue"
import BondsRepository from "@/data/BondsRepository"

export default {
	name: "PortfolioView",
	setup() {
		const isFetching = ref(true)
		const store = portfolioStore()
		const portfolioBonds = computed(() => store.values)
		const bondsRepository = new BondsRepository()

		onMounted(async () => {
			const bonds = store.values
			if (bonds.length === 0) {
				isFetching.value = false
				return
			}
			try {
				const results = await Promise.all(
					bonds.map((bond) => bondsRepository.coupons(bond.figi))
				)
				results.forEach((coupons, i) => {
					store.setBondCoupons(bonds[i].uid, coupons)
				})
			} finally {
				isFetching.value = false
			}
		})

		return {
			portfolioBonds,
			isFetching
		}
	}
}
</script>
