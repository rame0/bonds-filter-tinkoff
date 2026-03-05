<template>
	<table style="">
		<tr>
			<td>Всего бумаг:</td>
			<td>{{ totalBonds }}</td>
		</tr>
		<tr>
			<td>Всего купонов:</td>
			<td>{{ totalCoupons }}</td>
		</tr>
		<tr>
			<td>Профит от купонов:</td>
			<td>{{ totalProfit }}</td>
		</tr>
		<tr>
			<td>Цена покупки портфеля</td>
			<td>{{ totalPrice }}</td>
		</tr>
	</table>
</template>

<script lang="tsx">
import { ref } from "vue"
import SectorsCollation from "@/data/collations/SectorsCollation"
import IssueKindCollations from "@/data/collations/IssueKindCollations"
import ExchangeCollation from "@/data/collations/ExchangeCollation"
import { ElTag, ElText, ElAutoResizer } from "element-plus"
import CurrencyCollation from "@/data/collations/CurrencyCollation"
import { portfolioStore } from "@/data/portfolioStore"
import { Delete, Minus, Plus } from "@element-plus/icons-vue"

export default {
	name: "PortfolioStats",
	methods: { portfolioStore },
	props: {
		modelValue: {
			type: Array,
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
			return this.modelValue.reduce((sum, bond) => sum + bond.qty, 0)
		},
		totalPrice() {
			return this.modelValue.reduce(
				(sum, bond) => sum + ((bond.price * bond.nominal) / 100) * bond.qty,
				0
			).toFixed(2) * 1
		},
		totalCoupons() {
			return this.modelValue.reduce((sum, bond) => sum + bond?.coupons?.length, 0)
		},
		totalProfit() {
			return this.modelValue.reduce(
				(sum, bond) => sum + bond?.coupons?.reduce((sum, coupon) => sum + coupon.payout, 0),
				0
			)
		}
	}
}
</script>

<style></style>
