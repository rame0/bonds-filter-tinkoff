<template>
  <el-row>
    <!-- table -->

    <el-col :span="16" px="5" py="10" :class="'table-block'" id="table-view">
      <bonds-table
        v-model="bonds"
        :table-size="tableViewSize"
        :pagination-data="paginationData"
        :loading="isFetching"
      />
    </el-col>

    <!-- filter -->

    <el-col :span="8" px="5" py="10" :class="'table-block'">
      <bonds-filter v-model="filterSelections" :filter-options="filterOptions" />
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import BondsRepository from '@/data/BondsRepository'
import { onMounted, ref, watch } from 'vue'
import type { BondsResponse } from '@/data/Interfaces/BondsResoinse'
import { useStorage } from '@vueuse/core'

import CurrencyCollation from '@/data/collations/CurrencyCollation'
import CountryCollation from '@/data/collations/CountryCollation'
import type { FilterOptions } from '@/data/Types/FilterOptions'
import { DefaultFilterSelections, defaultFilterValues } from '@/data/Types/FilterOptions'
import { Helpers } from '@/utils/helpers'
import { type CombinedBondsResponse } from '../../../server/src/common/CombinedBondsResponse'

const bondsStore = useStorage<CombinedBondsResponse[]>('bonds', [])
const filterSelectionsStore = useStorage<FilterOptions>('filterSelections', DefaultFilterSelections)
const filterSelections = ref<FilterOptions>(filterSelectionsStore.value)

const filterOptions = ref(defaultFilterValues)

const response = ref<CombinedBondsResponse[]>([])
const isFetching = ref<Boolean>(false)
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
  if (bondsStore.value.length > 0) {
    response.value = bondsStore.value
  } else {
    const bondsRepository = new BondsRepository()
    response.value = await bondsRepository.list()
    bondsStore.value = response.value
  }

  // response.value = await bondsRepository.list()
  if (response.value) {
    updateFilters(response)
    updateTable()
  }

  isFetching.value = false
}

watch(
  paginationData,
  () => {
    updateTable()
  },
  { deep: true }
)

watch(
  filterSelections,
  () => {
    filterSelectionsStore.value = filterSelections.value
    updateTable()
  },
  { deep: true, flush: 'pre' }
)

const updateTable = () => {
  isFetching.value = true

  const appliedFilters = Object.entries(filterSelections.value).filter(([, value]) => {
    if (value instanceof Array) {
      return value.length > 0
    } else if (value instanceof Object) {
      return true
    } else if (typeof value === 'string') {
      return value !== ''
    } else {
      return value >= 0
    }
  })

  const filtered = response.value.filter((bond) => {
    for (const [key, value] of appliedFilters) {
      if (key === 'nominal' || key === 'placementPrice') {
        if (bond[key] < value['from'] || bond[key] > value['to']) {
          return false
        } else {
          continue
        }
      }
      if (value instanceof Array) {
        if (!value.includes(`${bond[key]}`)) {
          return false
        } else {
          continue
        }
      }
      if (value !== -1 && value != bond[key]) {
        return false
      }
    }
    return true
  })

  paginationData.value.total = filtered.length
  const start = (paginationData.value.currentPage - 1) * paginationData.value.pageSize
  const end = start + paginationData.value.pageSize
  bonds.value = filtered.slice(start, end)
  isFetching.value = false
}

const updateFilters = (response) => {
  for (const opt of arrayOptions) {
    let options = response.value.map((a) => a[opt])
    options = options
      .filter((a) => a !== null && a !== undefined && a !== '')
      .sort((a, b) => {
        if (a > b) return 1
        if (a < b) return -1
        return 0
      })
    options = [...new Set(options)].map((a) => {
      let label = a
      switch (opt) {
        case 'currency':
          label = CurrencyCollation.getLabel(a)
          break
        case 'countryOfRisk':
          label = CountryCollation.getLabel(a)
          break
      }
      return { value: a, label: label }
    })
    filterOptions.value[opt] = options
  }
}
const resizeTable = () => {
  const tableViewBlock = document.getElementById('table-view')

  if (tableViewBlock) {
    tableViewSize.value.width = tableViewBlock.clientWidth - 50
    tableViewSize.value.height = tableViewBlock.clientHeight - 80
  }
}

onMounted(() => {
  window.addEventListener('resize', resizeTable)

  resizeTable()
  fetchBonds()
})
</script>

<style>
.table-block {
  height: calc(100vh - var(--header-height) - 1px);
  //overflow: auto; background: var(--el-color-primary-light-9); color: var(--el-color-primary);
}
</style>
