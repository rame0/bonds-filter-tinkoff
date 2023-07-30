<template>
  <el-table-v2
    :columns="columns"
    :data="modelValue"
    :width="tableSize.width"
    :height="tableSize.height"
    :row-height="tableRowHeight"
    :v-scrollbar-size="2"
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
import { Helpers } from '@/utils/helpers'
import SectorsCollation from '@/data/collations/SectorsCollation'
import IssueKindCollations from '@/data/collations/IssueKindCollations'
import ExchangeCollation from '@/data/collations/ExchangeCollation'
import { ElTag, ElText, ElAutoResizer } from 'element-plus'
import CurrencyCollation from '@/data/collations/CurrencyCollation'
import { RiskStars, BondFlags, LinkToTinkoff } from '@/components/UI'

export default {
  name: 'BondsTable',
  props: {
    modelValue: {
      type: Object,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    tableSize: {
      type: Object,
      required: true
    },
    paginationData: {
      type: Object,
      required: true
    }
  },

  setup(props) {
    // const paginationData = toRef(props, 'paginationData')

    const columns = [
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
        cellRenderer: ({ cellData: value }) => <LinkToTinkoff ticker={value} />
      },
      {
        title: 'Погашение через',
        key: 'maturityDate',
        dataKey: 'maturityDate',
        width: 100,
        cellRenderer: ({ cellData: value }) => {
          const date = new Date(value).setHours(12, 0, 0, 0)
          const now = new Date().setHours(12, 0, 0, 0)
          return  Math.round((date - now) / 8.64e7 / 30) + ' мес.'
        }
      },
      {
        title: 'Номинал',
        key: 'nominal',
        dataKey: 'nominal',
        width: 100,
        sortable: true,
        cellRenderer: ({ cellData: value, rowData: row }) => {
          return Helpers.toNumber(value) + ' ' + CurrencyCollation.getLabel(row.currency)
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
        title: 'Сектор',
        key: 'sector',
        dataKey: 'sector',
        width: 130,
        sortable: true,
        cellRenderer: ({ cellData: value }) => {
          return SectorsCollation.getLabel(value)
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
        width: 150,
        sortable: true,
        cellRenderer: ({ cellData: value }) => <RiskStars level={value} />
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

    // paginationData.value.total = 1000
    // paginationData.value.pageSize = 100
    // paginationData.value.currentPage = 1

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
      ExchangeCollation,
      Helpers
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
