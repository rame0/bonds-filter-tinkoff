<template>
  <div class="space-y-6">
    <section class="space-y-2">
      <label class="block text-sm font-medium text-slate-700 dark:text-slate-200">
        Поиск (название/тикер/figi)
      </label>
      <div class="flex gap-2">
        <input
          v-model="value.search"
          type="text"
          placeholder="Поиск"
          class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-emerald-900"
        />
        <button
          v-if="value.search"
          type="button"
          class="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-rose-500 hover:text-rose-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-rose-400 dark:hover:text-rose-300"
          @click="value.search = ''"
        >
          Сбросить
        </button>
      </div>
    </section>

    <section class="grid grid-cols-1 gap-4 2xl:grid-cols-4 xl:grid-cols-2">
      <div class="space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-200">Номинал</label>
        <div class="flex flex-col gap-3">
          <div class="flex items-center gap-1">
            <button type="button" class="stepper-btn" @click="value.nominal.from = Math.max(filterOptions.nominal.from, (value.nominal.from ?? 0) - 1)" aria-label="Уменьшить">−</button>
            <input
              v-model.number="value.nominal.from"
              type="number"
              :min="filterOptions.nominal.from"
              :max="value.nominal.to"
              class="range-input flex-1 min-w-0"
            />
            <button type="button" class="stepper-btn" @click="value.nominal.from = Math.min(value.nominal.to, (value.nominal.from ?? 0) + 1)" aria-label="Увеличить">+</button>
          </div>
          <div class="flex items-center gap-1">
            <button type="button" class="stepper-btn" @click="value.nominal.to = Math.max(value.nominal.from, (value.nominal.to ?? 0) - 1)" aria-label="Уменьшить">−</button>
            <input
              v-model.number="value.nominal.to"
              type="number"
              :min="value.nominal.from"
              :max="filterOptions.nominal.to"
              class="range-input flex-1 min-w-0"
            />
            <button type="button" class="stepper-btn" @click="value.nominal.to = Math.min(filterOptions.nominal.to, (value.nominal.to ?? 0) + 1)" aria-label="Увеличить">+</button>
          </div>
        </div>
      </div>

      <div class="space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-200">Цена</label>
        <div class="flex flex-col gap-3">
          <div class="flex items-center gap-1">
            <button type="button" class="stepper-btn" @click="value.price.from = Math.max(filterOptions.price.from, (value.price.from ?? 0) - 1)" aria-label="Уменьшить">−</button>
            <input
              v-model.number="value.price.from"
              type="number"
              :min="filterOptions.price.from"
              :max="value.price.to"
              class="range-input flex-1 min-w-0"
            />
            <button type="button" class="stepper-btn" @click="value.price.from = Math.min(value.price.to, (value.price.from ?? 0) + 1)" aria-label="Увеличить">+</button>
          </div>
          <div class="flex items-center gap-1">
            <button type="button" class="stepper-btn" @click="value.price.to = Math.max(value.price.from, (value.price.to ?? 0) - 1)" aria-label="Уменьшить">−</button>
            <input
              v-model.number="value.price.to"
              type="number"
              :min="value.price.from"
              :max="filterOptions.price.to"
              class="range-input flex-1 min-w-0"
            />
            <button type="button" class="stepper-btn" @click="value.price.to = Math.min(filterOptions.price.to, (value.price.to ?? 0) + 1)" aria-label="Увеличить">+</button>
          </div>
        </div>
      </div>

      <div class="space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-200">Доходность</label>
        <div class="flex flex-col gap-3">
          <div class="flex items-center gap-1">
            <button type="button" class="stepper-btn" @click="value.bondYield.from = Math.max(filterOptions.bondYield.from, (value.bondYield.from ?? 0) - 1)" aria-label="Уменьшить">−</button>
            <input
              v-model.number="value.bondYield.from"
              type="number"
              :min="filterOptions.bondYield.from"
              :max="value.bondYield.to"
              class="range-input flex-1 min-w-0"
            />
            <button type="button" class="stepper-btn" @click="value.bondYield.from = Math.min(value.bondYield.to, (value.bondYield.from ?? 0) + 1)" aria-label="Увеличить">+</button>
          </div>
          <div class="flex items-center gap-1">
            <button type="button" class="stepper-btn" @click="value.bondYield.to = Math.max(value.bondYield.from, (value.bondYield.to ?? 0) - 1)" aria-label="Уменьшить">−</button>
            <input
              v-model.number="value.bondYield.to"
              type="number"
              :min="value.bondYield.from"
              :max="filterOptions.bondYield.to"
              class="range-input flex-1 min-w-0"
            />
            <button type="button" class="stepper-btn" @click="value.bondYield.to = Math.min(filterOptions.bondYield.to, (value.bondYield.to ?? 0) + 1)" aria-label="Увеличить">+</button>
          </div>
        </div>
      </div>

      <div class="space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-200">Погашение (мес)</label>
        <div class="flex flex-col gap-3">
          <div class="flex items-center gap-1">
            <button type="button" class="stepper-btn" @click="value.duration.from = Math.max(filterOptions.duration.from, (value.duration.from ?? 0) - 1)" aria-label="Уменьшить">−</button>
            <input
              v-model.number="value.duration.from"
              type="number"
              :min="filterOptions.duration.from"
              :max="value.duration.to"
              class="range-input flex-1 min-w-0"
            />
            <button type="button" class="stepper-btn" @click="value.duration.from = Math.min(value.duration.to, (value.duration.from ?? 0) + 1)" aria-label="Увеличить">+</button>
          </div>
          <div class="flex items-center gap-1">
            <button type="button" class="stepper-btn" @click="value.duration.to = Math.max(value.duration.from, (value.duration.to ?? 0) - 1)" aria-label="Уменьшить">−</button>
            <input
              v-model.number="value.duration.to"
              type="number"
              :min="value.duration.from"
              :max="filterOptions.duration.to"
              class="range-input flex-1 min-w-0"
            />
            <button type="button" class="stepper-btn" @click="value.duration.to = Math.min(filterOptions.duration.to, (value.duration.to ?? 0) + 1)" aria-label="Увеличить">+</button>
          </div>
        </div>
      </div>
    </section>

    <section class="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <bond-options-select v-model="value.currency" :options="filterOptions.currency" label="Валюта" />
      <bond-options-select
        v-model="value.couponQuantityPerYear"
        :options="filterOptions.couponQuantityPerYear"
        label="Купонов"
      />
      <bond-options-select
        v-model="value.countryOfRisk"
        :options="filterOptions.countryOfRisk"
        label="Страна"
      />
    </section>

    <section class="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <div class="space-y-2">
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-200">Доступна для ИИС</label>
        <bond-options-radios v-model="value.forIisFlag" />
      </div>
      <div class="space-y-2">
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-200">Для квалов</label>
        <bond-options-radios v-model="value.forQualInvestorFlag" />
      </div>
      <div class="space-y-2">
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-200">Индексация номинала</label>
        <bond-options-radios v-model="value.indexedNominalFlag" />
      </div>
      <div class="space-y-2">
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-200">Есть обеспечение</label>
        <bond-options-radios v-model="value.collateralFlag" />
      </div>
      <div class="space-y-2">
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-200">Купоны не облаг. налогом</label>
        <bond-options-radios v-model="value.taxFreeFlag" />
      </div>
      <div class="space-y-2">
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-200">Плавающий купон</label>
        <bond-options-radios v-model="value.floatingCouponFlag" />
      </div>
      <div class="space-y-2">
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-200">С амортизацией</label>
        <bond-options-radios v-model="value.amortizationFlag" />
      </div>
      <div class="space-y-2">
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-200">Уровень риска</label>
        <bond-options-checks v-model="value.riskLevel" :options="filterOptions.riskLevel" />
      </div>
      <div class="space-y-2">
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-200">Ликвидность</label>
        <bond-options-checks v-model="value.liquidity" :options="filterOptions.liquidity" />
      </div>
    </section>

    <section class="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <bond-options-select v-model="value.sector" :options="filterOptions.sector" label="Сектор" />
      <bond-options-select
        v-model="value.issueKind"
        :options="filterOptions.issueKind"
        label="Форма выпуска"
      />
      <bond-options-select
        v-model="value.realExchange"
        :options="filterOptions.realExchange"
        label="Биржа"
      />
    </section>

    <section class="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <div class="space-y-2">
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-200">Доступен шорт</label>
        <bond-options-radios v-model="value.shortEnabledFlag" />
      </div>
      <div class="space-y-2">
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-200">Внебиржевая</label>
        <bond-options-radios v-model="value.otcFlag" />
      </div>
      <div class="space-y-2">
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-200">Доступна для покупки</label>
        <bond-options-radios v-model="value.buyAvailableFlag" />
      </div>
      <div class="space-y-2">
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-200">Доступна для продажи</label>
        <bond-options-radios v-model="value.sellAvailableFlag" />
      </div>
      <div class="space-y-2">
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-200">Бессрочная</label>
        <bond-options-radios v-model="value.perpetualFlag" />
      </div>
      <div class="space-y-2">
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-200">Доступна торговля по API</label>
        <bond-options-radios v-model="value.apiTradeAvailableFlag" />
      </div>
      <div class="space-y-2">
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-200">Торговля по выходным</label>
        <bond-options-radios v-model="value.weekendFlag" />
      </div>
      <div class="space-y-2">
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-200">Блокировка ТКС</label>
        <bond-options-radios v-model="value.blockedTcaFlag" />
      </div>
      <div class="space-y-2">
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-200">Субординированная</label>
        <bond-options-radios v-model="value.subordinatedFlag" />
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { BondOptionsChecks, BondOptionsRadios, BondOptionsSelect } from '@/components/UI'
import { type FilterValues, type FilterOptions } from '@/data/Types/FilterOptions'
import type { PropType } from 'vue'

export default {
  name: 'BondFilter',
  props: {
    filterOptions: {
      type: Object as PropType<FilterValues>,
      required: true
    },
    modelValue: {
      type: Object as PropType<FilterOptions>,
      required: true
    }
  },

  data() {
    return {
      value: this.modelValue
    }
  },

  setup() {
    return {
      BondOptionsChecks,
      BondOptionsRadios,
      BondOptionsSelect
    }
  },
  watch: {
    value: {
      handler(newValue) {
        this.$emit('change', newValue)
      },
      deep: true
    }
  }
}
</script>

<style scoped>
.stepper-btn {
  @apply flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-emerald-900;
}
.range-input {
  @apply w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-emerald-900;
}
</style>
