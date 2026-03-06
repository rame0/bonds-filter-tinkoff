<template>
	<div class="grid grid-cols-1 xl:grid-cols-24">
		<!-- table -->

		<div
			class="h-[calc(100vh-var(--header-height)-1px)] bg-[var(--app-color-primary-soft)] px-5 py-5 text-[var(--app-color-primary)] xl:col-span-16"
			id="table-view"
		>
			<portfolio-table v-model="portfolioBonds" :loading="isFetching" />
		</div>

		<!-- stats -->

		<div
			class="h-[calc(100vh-var(--header-height)-1px)] bg-[var(--app-color-primary-soft)] px-5 py-5 text-[var(--app-color-primary)] xl:col-span-8"
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

