<template>
  <el-row>
    <!-- table -->

    <el-col :span="16" px="5" py="5" :class="'table-block'" id="table-view">
      <bonds-table
        v-model="bonds"
        :table-size="tableViewSize"
        :pagination-data="paginationData"
        :loading="isFetching"
        :sort-state="sortState"
        @update:sort-state="sortChanged"
      />
    </el-col>

    <!-- filter -->

    <el-col :span="8" px="5" py="5" :class="'table-block'">
      <bonds-filter v-model="filterSelections" :filter-options="filterOptions" />
    </el-col>
  </el-row>
</template>

<script lang="ts">
import BondsRepository from '@/data/BondsRepository'
import { ref } from 'vue'
import { useStorage } from '@vueuse/core'

import CurrencyCollation from '@/data/collations/CurrencyCollation'
import CountryCollation from '@/data/collations/CountryCollation'
import type { FilterOptions, FilterValues, FromTo } from '@/data/Types/FilterOptions'
import { DefaultFilterSelections, defaultFilterValues } from '@/data/Types/FilterOptions'
import { type CombinedBondsResponse } from '../../../server/src/common/CombinedBondsResponse'
import { SortBy, TableV2SortOrder } from 'element-plus'

export default {
  name: 'HomeView',

  setup() {
    const bondsRepository = new BondsRepository()
    const filterSelectionsStore = useStorage<FilterOptions>(
      'filterSelections',
      DefaultFilterSelections
    )
    const sortState = useStorage<SortBy>('sort-state', {
      key: 'name',
      order: TableV2SortOrder.ASC
    })

    const filterSelections = ref<FilterOptions>(filterSelectionsStore.value)

    const filterOptions = ref(defaultFilterValues)

    const response = ref<CombinedBondsResponse[]>([])
    const isFetching = ref(false)
    const tableViewSize = ref({
      width: 0,
      height: 0
    })

    const bonds = ref<CombinedBondsResponse[]>([])

    const arrayOptions = ['classCode', 'currency', 'couponQuantityPerYear', 'countryOfRisk']
    const paginationData = ref({
      total: 0,
      pageSize: useStorage<number>('pageSize', 20),
      currentPage: 1
    })

    const fetchBonds = async () => {
      isFetching.value = true
      response.value = await bondsRepository.list()

      // response.value = await bondsRepository.list()
      if (response.value) {
        updateFilters()
        updateTable()
      }

      isFetching.value = false
    }

    const isRange = (
      value: any
    ): value is {
      from: number
      to: number
      // eslint-disable-next-line no-prototype-builtins
    } => value.hasOwnProperty('from') && value.hasOwnProperty('to')

    const sortChanged = (sort: SortBy) => {
      sortState.value = sort
      updateTable()
    }
    const updateTable = () => {
      isFetching.value = true

      const appliedFilters = Object.entries(filterSelections.value).filter(([, value]) => {
        if (value === undefined) {
          return false
        } else if (Array.isArray(value)) {
          return (value as []).length > 0
        } else if (isRange(value)) {
          return true
        } else if (typeof value === 'string') {
          return value !== ''
        } else {
          return (value as number) >= 0
        }
      })

      const filtered = response.value.filter((bond) => {
        for (const [key, value] of appliedFilters) {
          const bondKeyValue = bond[key as keyof CombinedBondsResponse]
          if (key === 'nominal' || key === 'placementPrice' || key === 'price') {
            if (
              (bondKeyValue as number) < (value as FromTo).from ||
              (bondKeyValue as number) > (value as FromTo).to
            ) {
              return false
            } else {
              continue
            }
          }
          if (value instanceof Array) {
            if (!value.includes(`${bondKeyValue}`)) {
              return false
            } else {
              continue
            }
          }
          if (value !== -1 && value != bondKeyValue) {
            return false
          }
        }
        return true
      })

      paginationData.value.total = filtered.length
      const start = (paginationData.value.currentPage - 1) * paginationData.value.pageSize
      const end = start + paginationData.value.pageSize

      const sorted = filtered.sort((a, b) => {
        const key = sortState.value.key as keyof CombinedBondsResponse
        const order = sortState.value.order
        if (a[key] === undefined) return 1
        if (b[key] === undefined) return -1
        if (a[key] > b[key]) return order === TableV2SortOrder.ASC ? 1 : -1
        if (a[key] < b[key]) return order === TableV2SortOrder.ASC ? -1 : 1
        return 0
      })

      bonds.value = sorted.slice(start, end)
      isFetching.value = false
    }

    const updateFilters = () => {
      for (const opt of arrayOptions) {
        let options = response.value.map((a) => a[opt as keyof CombinedBondsResponse])

        options = options
          .filter((a) => a !== null && a !== undefined && a !== '')
          .sort((a, b) => {
            if (a === undefined || b === undefined) return 0
            if (a > b) return 1
            if (a < b) return -1
            return 0
          })

        // @ts-ignore
        filterOptions.value[opt as keyof FilterValues] = [...new Set(options)].map((a) => {
          let label = a
          switch (opt) {
            case 'currency':
              // @ts-ignore
              label = CurrencyCollation.getLabel(a as string)
              break
            case 'countryOfRisk':
              // @ts-ignore
              label = CountryCollation.getLabel(a as string)
              break
          }
          return { value: a as string, label: label }
        })
      }
    }

    return {
      bonds,
      isFetching,
      filterOptions,
      filterSelections,
      paginationData,
      tableViewSize,
      filterSelectionsStore,
      sortState,
      fetchBonds,
      updateTable,
      sortChanged
    }
  },
  //
  // data() {
  //   return {
  //     isFetching: this.isFetching
  //   }
  // },

  watch: {
    paginationData: {
      handler() {
        this.updateTable()
      },
      deep: true
    },
    filterSelections: {
      handler() {
        this.filterSelectionsStore = this.filterSelections
        this.updateTable()
      },
      deep: true
    }
  },

  mounted() {
    const resizeTable = () => {
      const tableViewBlock = document.getElementById('table-view')

      if (tableViewBlock) {
        this.tableViewSize.width = tableViewBlock.clientWidth - 50
        this.tableViewSize.height = tableViewBlock.clientHeight - 80
      }
    }

    window.addEventListener('resize', resizeTable)

    resizeTable()
    this.fetchBonds()
  }
}
</script>

<style>
.table-block {
  height: calc(100vh - var(--header-height) - 1px);
  /*overflow: auto;*/
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}
</style>
