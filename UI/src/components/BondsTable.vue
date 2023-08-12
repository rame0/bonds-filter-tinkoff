<template>
  <el-table-v2
    :columns="columns"
    :data="modelValue"
    :width="tableSize.width"
    :height="tableSize.height"
    :row-height="tableRowHeight"
    :v-scrollbar-size="2"
    :sort-by="sortState"
    @column-sort="$emit('update:sortState', $event)"
    fixed
  >
    <template #overlay v-if="loading">
      <loading-overlay />
    </template>
  </el-table-v2>

  <el-pagination
    background
    small
    :hide-on-single-page="true"
    :total="paginationData.total"
    :page-size="paginationData.pageSize"
    :current-page="paginationData.currentPage"
    :page-sizes="[20, 50, 100]"
    layout="sizes, prev, pager, next, ->, total"
    @current-change="(v) => (paginationData.currentPage = v)"
    @update:page-size="(v) => (paginationData.pageSize = v)"
  />
</template>

<script lang="tsx">
import { h, PropType, ref } from 'vue'
import SectorsCollation from '@/data/collations/SectorsCollation'
import IssueKindCollations from '@/data/collations/IssueKindCollations'
import ExchangeCollation from '@/data/collations/ExchangeCollation'
import { ElTag, ElText, ElAutoResizer, SortBy, TableV2SortOrder } from 'element-plus'
import CurrencyCollation from '@/data/collations/CurrencyCollation'
import { RiskStars, BondFlags, LinksToExchange, LiquidityArrow } from '@/components/UI'
import type { AnyColumns } from 'element-plus/es/components/table-v2/src/types'

export default {
  name: 'BondsTable',
  props: {
    modelValue: {
      type: Array,
      required: true
    },
    loading: Boolean,
    tableSize: {
      type: Object,
      required: true
    },
    paginationData: {
      type: Object,
      required: true
    },
    sortState: {
      type: Object as PropType<SortBy>,
      required: true
    }
  },
  emits: ['update:sortState'],

  setup(props) {
    // const paginationData = toRef(props, 'paginationData')

    const columns: AnyColumns = [
      {
        title: 'Название',
        key: 'name',
        dataKey: 'name',
        width: 200,
        sortable: true
      },
      {
        title: 'Тикер',
        key: 'ticker',
        dataKey: 'ticker',
        width: 135,
        cellRenderer: ({ cellData: value, rowData: row }) => (
          <LinksToExchange ticker={value} exchange={row.realExchange} />
        )
      },
      {
        title: 'Дюрация',
        key: 'duration',
        dataKey: 'duration',
        width: 100,
        sortable: true,
        cellRenderer: ({ cellData: value }) => {
          return h('span', value + ' мес.')
        }
      },
      {
        title: 'Номинал',
        key: 'nominal',
        dataKey: 'nominal',
        width: 100,
        sortable: true,
        cellRenderer: ({ cellData: value, rowData: row }) => {
          return h('span', value + ' ' + CurrencyCollation.getLabel(row['currency']))
        }
      },
      {
        title: 'Цена',
        key: 'price',
        dataKey: 'price',
        width: 100,
        sortable: true,
        cellRenderer: ({ cellData: value }) => {
          return h('span', value + ' %')
        }
      },
      {
        title: 'Купон в год',
        key: 'coupon',
        dataKey: 'couponQuantityPerYear',
        width: 50,
        sortable: true
      },
      {
        title: 'НКД',
        key: 'aciValue',
        dataKey: 'aciValue',
        width: 70,
        sortable: false,
        cellRenderer: ({ cellData: value, rowData: row }) => {
          return h(
            'span',
            (value as number).toFixed(2) + ' ' + CurrencyCollation.getLabel(row['currency'])
          )
        }
      },
      {
        title: 'Доходность',
        key: 'bondYield',
        dataKey: 'bondYield',
        width: 100,
        sortable: true,
        cellRenderer: ({ cellData: value }) => {
          return h('span', (value as number).toFixed(2) + ' %')
        }
      },
      {
        title: 'Сектор',
        key: 'sector',
        dataKey: 'sector',
        width: 130,
        sortable: true,
        cellRenderer: ({ cellData: value }) => {
          return h('span', SectorsCollation.getLabel(value) as string)
        }
      },
      // {
      //   title: 'Форма выпуска',
      //   key: 'issueKind',
      //   dataKey: 'issueKind',
      //   width: 150,
      //   sortable: true,
      //   cellRenderer: ({ cellData: value }) => {
      //     return IssueKindCollations.getLabel(value)
      //   }
      // },
      {
        title: 'Уровень риска',
        key: 'riskLevel',
        dataKey: 'riskLevel',
        width: 100,
        sortable: true,
        cellRenderer: ({ cellData: value }) => <RiskStars level={value} />
      },
      {
        title: 'Ликвидность',
        key: 'liquidity',
        dataKey: 'liquidity',
        width: 50,
        sortable: true,
        cellRenderer: ({ cellData: value }) => <LiquidityArrow level={value} />
      },
      // {
      //   title: 'Биржа',
      //   key: 'realExchange',
      //   dataKey: 'realExchange',
      //   width: 100,
      //   cellRenderer: ({ cellData: value }) => {
      //     return ExchangeCollation.getLabel(value)
      //   }
      // },
      {
        title: 'Свойства',
        key: 'properties',
        dataKey: 'properties',
        width: 600,
        cellRenderer: ({ rowData: row }) => <BondFlags row={row} show={optionsToShow} />
      }
    ]

    const tableWidth = columns.reduce((acc, { width }) => acc + width, 0)
    const tableRowHeight = 72
    const tableHeight = (tableRowHeight * 20.7).toFixed(0)

    const optionsToShow = [
      'forIisFlag',
      'forQualInvestorFlag',
      // 'indexedNominalFlag',
      // 'collateralFlag',
      // 'taxFreeFlag',
      'floatingCouponFlag',
      'amortizationFlag',
      // 'shortEnabledFlag',
      'otcFlag',
      'buyAvailableFlag',
      'sellAvailableFlag',
      'perpetualFlag',
      // 'apiTradeAvailableFlag',
      'weekendFlag',
      // 'blockedTcaFlag',
      'subordinatedFlag'
    ]

    return {
      columns,
      optionsToShow,
      tableWidth,
      tableHeight,
      tableRowHeight,
      ElText,
      ElTag,
      ElAutoResizer,
      BondFlags,
      SectorsCollation,
      IssueKind: IssueKindCollations,
      ExchangeCollation
    }
  },

  data() {
    return {
      bonds: this.modelValue
    }
  }
}
</script>

<style></style>
