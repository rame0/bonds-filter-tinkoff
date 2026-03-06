<template>
	<el-row>
		<!-- table -->

		<el-col
			:span="16"
			class="h-[calc(100vh-var(--header-height)-1px)] bg-[var(--ep-color-primary-light-9)] px-5 py-5 text-[var(--ep-color-primary)]"
			id="table-view"
		>
			<portfolio-table v-model="portfolioBonds" :loading="isFetching" />
		</el-col>

		<!-- stats -->

		<el-col
			:span="8"
			class="h-[calc(100vh-var(--header-height)-1px)] bg-[var(--ep-color-primary-light-9)] px-5 py-5 text-[var(--ep-color-primary)]"
		>
			<portfolio-stats v-model="portfolioBonds" :loading="isFetching" />
		</el-col>
	</el-row>
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

