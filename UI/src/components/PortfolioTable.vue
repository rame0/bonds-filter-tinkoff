<template>
	<el-table
		:data="modelValue"
		:width="tableViewSize.width"
		:row-height="tableRowHeight"
		v-loading="loading"
		style="width: 100%"
	>
		<el-table-column
			prop="operations"
			min-width="50"
			align="center"
			fixed="left"
			v-if="showAddButton"
		>
			<template #header>
				<el-tooltip content="Удалить все">
					<el-button
						:icon="Delete"
						circle
						type="danger"
						size="small"
						:disabled="portfolioStore().isEmpty"
						@click="portfolioStore().dropAllBonds()"
					/>
				</el-tooltip>
			</template>
			<template #default="{ row }">
				<el-button
					:icon="Minus"
					circle
					type="danger"
					size="small"
					:disabled="portfolioStore().getBondQty(row.uid) < 1"
					@click="portfolioStore().decreaseQty(row.uid)"
				/>
			</template>
		</el-table-column>
		<el-table-column prop="name" label="Название" min-width="200" fixed="left" sortable>
			<template #default="{ row }">
				&nbsp;<br />
				<el-badge
					:value="portfolioStore().getBondQty(row.uid)"
					class="item"
					type="primary"
					:max="99"
					:hidden="portfolioStore().getBondQty(row.uid) < 1"
				>
					<el-text>{{ row.name }}</el-text>
				</el-badge>
				<br />&nbsp;
			</template>
		</el-table-column>
		<el-table-column
			prop="operations"
			min-width="50"
			align="center"
			fixed="left"
			v-if="showAddButton"
		>
			<template #default="{ row }">
				<el-button
					:icon="Plus"
					circle
					type="success"
					size="small"
					@click="portfolioStore().increaseQty(row)"
				/>
			</template>
		</el-table-column>
		<el-table-column prop="ticker" label="Тикер" min-width="135" fixed="left">
			<template #default="{ row }">
				<links-to-exchange :ticker="row.ticker" :exchange="row.realExchange" />
			</template>
		</el-table-column>
		<el-table-column prop="duration" label="Погашение" min-width="100" sortable>
			<template #default="{ row }">
				<el-text>{{ row.duration }} мес.</el-text>
			</template>
		</el-table-column>
		<el-table-column prop="nominal" label="Номинал" min-width="100" sortable>
			<template #default="{ row }">
				<el-text>{{ row.nominal }} {{ CurrencyCollation.getLabel(row["currency"]) }}</el-text>
			</template>
		</el-table-column>
		<el-table-column prop="price" label="Цена" min-width="100" sortable>
			<template #default="{ row }">
				<el-text>{{ row.price }} %</el-text>
			</template>
		</el-table-column>
		<el-table-column prop="bondYield" label="Доходность" width="100" sortable>
			<template #default="{ row }">
				<el-text>{{ row.bondYield?.toFixed(2) }}%</el-text>
			</template>
		</el-table-column>
		<el-table-column prop="couponsYield" label="∑ Купон за год" width="100" sortable>
			<template #default="{ row }">
				<el-text
				>{{ row.couponsYield }}
					{{ CurrencyCollation.getLabel(row["currency"]) }}
				</el-text>
			</template>
		</el-table-column>
		<el-table-column prop="aciValue" label="НКД" min-width="70">
			<template #default="{ row }">
				<el-text
					>{{ row.aciValue.toFixed(2) }} {{ CurrencyCollation.getLabel(row["currency"]) }}
				</el-text>
			</template>
		</el-table-column>
		<el-table-column prop="riskLevel" label="Уровень риска" min-width="100" sortable>
			<template #default="{ row }">
				<risk-stars :level="row.riskLevel" />
			</template>
		</el-table-column>
		<el-table-column prop="sector" label="Сектор" min-width="130">
			<template #default="{ row }">
				<el-text>{{ SectorsCollation.getLabel(row.sector) }}</el-text>
			</template>
		</el-table-column>
		<el-table-column prop="issueKind" label="Форма выпуска" min-width="150">
			<template #default="{ row }">
				<el-text>{{ IssueKindCollations.getLabel(row.issueKind) }}</el-text>
			</template>
		</el-table-column>
		<el-table-column prop="liquidity" label="Ликвидность" min-width="50">
			<template #default="{ row }">
				<liquidity-arrow :level="row.liquidity ?? 0" />
			</template>
		</el-table-column>
	</el-table>
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
	name: "PortfolioTable",
	methods: { portfolioStore },
	props: {
		modelValue: {
			type: Array,
			required: true
		},
		loading: Boolean,
		showAddButton: {
			type: Boolean,
			default: true
		}
	},

	setup() {
		const tableViewSize = ref({
			width: 0,
			height: 0
		})
		const tableRowHeight = 72
		const tableHeight = (tableRowHeight * 20.7).toFixed(0)

		return {
			tableHeight,
			tableRowHeight,
			tableViewSize,
			ElText,
			ElTag,
			ElAutoResizer,
			SectorsCollation,
			IssueKindCollations,
			ExchangeCollation,
			CurrencyCollation,
			Delete,
			Minus,
			Plus
		}
	},

	mounted() {
		const resizeTable = () => {
			const tableViewBlock = document.getElementById("table-view")

			if (tableViewBlock) {
				this.tableViewSize.width = tableViewBlock.clientWidth - 50
				this.tableViewSize.height = tableViewBlock.clientHeight - 80
			}
		}

		window.addEventListener("resize", resizeTable)

		resizeTable()
	},
	data() {
		return {
			bonds: this.modelValue
		}
	}
}
</script>

<style></style>
