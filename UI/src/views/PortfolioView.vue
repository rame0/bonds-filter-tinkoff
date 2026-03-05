<template>
	<el-row>
		<!-- table -->

		<el-col :span="16" :class="'table-block px-5 py-5'" id="table-view">
			<portfolio-table v-model="portfolioBonds" :loading="isFetching" />
		</el-col>

		<!-- stats -->

		<el-col :span="8" :class="'table-block px-5 py-5'">
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

<style scoped></style>
