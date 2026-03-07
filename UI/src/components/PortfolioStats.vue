<template>
	<table class="w-full border-collapse text-sm">
		<tbody>
			<tr class="border-b border-slate-200/60">
				<td class="py-3 pr-4 font-medium">Всего бумаг:</td>
				<td class="py-3 text-right">{{ totalBonds }}</td>
			</tr>
			<tr class="border-b border-slate-200/60">
				<td class="py-3 pr-4 font-medium">Всего купонов:</td>
				<td class="py-3 text-right">{{ totalCoupons }}</td>
			</tr>
			<tr class="border-b border-slate-200/60">
				<td class="py-3 pr-4 font-medium">Профит от купонов:</td>
				<td class="py-3 text-right">{{ totalProfit }}</td>
			</tr>
			<tr>
				<td class="py-3 pr-4 font-medium">Цена покупки портфеля</td>
				<td class="py-3 text-right">{{ totalPrice }}</td>
			</tr>
		</tbody>
	</table>
</template>

<script lang="tsx">
import type { PropType } from "vue"
import type { CombinedBondsResponse } from "@/external/interfaces/CombinedBondsResponse"
import { portfolioStore } from "@/data/portfolioStore"

export default {
	name: "PortfolioStats",
	methods: { portfolioStore },
	props: {
		modelValue: {
			type: Array as PropType<CombinedBondsResponse[]>,
			required: true
		},
		loading: Boolean
	},

	setup(props) {
		// const totalBonds = ref(0)
		// const totalCoupons = ref(0)
		// const totalProfit = ref(0)
		//
		// totalBonds.value = props.modelValue.reduce((sum, bond) => sum + bond.qty, 0)
		// totalCoupons.value = props.modelValue.reduce((sum, bond) => sum + bond.coupons.length, 0)
		// totalProfit.value = props.modelValue.reduce(
		// 	(sum, bond) =>
		// 		sum + bond.coupons.reduce((sum, coupon) => sum + (coupon.isPayed ? coupon.payout : 0), 0),
		// 	0
		// )
		//
		// return {
		// 	totalBonds,
		// 	totalCoupons,
		// 	totalProfit
		// }
	},

	computed: {
		totalBonds() {
			return (this.modelValue as CombinedBondsResponse[]).reduce((sum, bond) => sum + bond.qty, 0)
		},
		totalPrice() {
			return Number(
				(this.modelValue as CombinedBondsResponse[]).reduce(
					(sum, bond) => sum + ((((bond.price ?? 0) * (bond.nominal ?? 0)) / 100) * bond.qty),
					0
				).toFixed(2)
			)
		},
		totalCoupons() {
			return (this.modelValue as CombinedBondsResponse[]).reduce((sum, bond) => sum + (bond.coupons?.length ?? 0), 0)
		},
		totalProfit() {
			return (this.modelValue as CombinedBondsResponse[]).reduce(
				(sum, bond) =>
					sum + (bond.coupons?.reduce((couponSum, coupon) => couponSum + (coupon.payout ?? 0), 0) ?? 0),
				0
			)
		}
	}
}
</script>

