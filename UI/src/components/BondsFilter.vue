<template>
  <div class="space-y-4">
    <section class="space-y-1.5">
      <label class="label-text block text-sm font-medium text-base-content">
        Поиск (название/тикер/figi)
      </label>
      <div class="flex gap-2">
        <input
          v-model="value.search"
          type="text"
          placeholder="Поиск"
          class="input input-bordered input-sm w-full"
        />
        <button
          v-if="value.search"
          type="button"
          class="btn btn-outline btn-sm btn-error"
          @click="value.search = ''"
        >
          Сбросить
        </button>
      </div>
    </section>

    <section class="grid grid-cols-1 gap-3 2xl:grid-cols-4 xl:grid-cols-2">
      <div class="space-y-1.5 rounded-box border border-base-300 bg-base-100 p-2.5">
        <label class="label-text block text-sm font-medium text-base-content">Номинал</label>
        <div class="flex flex-col gap-1.5">
          <div class="stepper-group">
            <button type="button" class="stepper-btn" @click="value.nominal.from = Math.max(filterOptions.nominal.from, (value.nominal.from ?? 0) - 1)" aria-label="Уменьшить">−</button>
            <input
              v-model.number="value.nominal.from"
              type="number"
              :min="filterOptions.nominal.from"
              :max="value.nominal.to"
              class="range-input"
            />
            <button type="button" class="stepper-btn" @click="value.nominal.from = Math.min(value.nominal.to, (value.nominal.from ?? 0) + 1)" aria-label="Увеличить">+</button>
          </div>
          <div class="stepper-group">
            <button type="button" class="stepper-btn" @click="value.nominal.to = Math.max(value.nominal.from, (value.nominal.to ?? 0) - 1)" aria-label="Уменьшить">−</button>
            <input
              v-model.number="value.nominal.to"
              type="number"
              :min="value.nominal.from"
              :max="filterOptions.nominal.to"
              class="range-input"
            />
            <button type="button" class="stepper-btn" @click="value.nominal.to = Math.min(filterOptions.nominal.to, (value.nominal.to ?? 0) + 1)" aria-label="Увеличить">+</button>
          </div>
        </div>
      </div>

      <div class="space-y-1.5 rounded-box border border-base-300 bg-base-100 p-2.5">
        <label class="label-text block text-sm font-medium text-base-content">Цена</label>
        <div class="flex flex-col gap-1.5">
          <div class="stepper-group">
            <button type="button" class="stepper-btn" @click="value.price.from = Math.max(filterOptions.price.from, (value.price.from ?? 0) - 1)" aria-label="Уменьшить">−</button>
            <input
              v-model.number="value.price.from"
              type="number"
              :min="filterOptions.price.from"
              :max="value.price.to"
              class="range-input"
            />
            <button type="button" class="stepper-btn" @click="value.price.from = Math.min(value.price.to, (value.price.from ?? 0) + 1)" aria-label="Увеличить">+</button>
          </div>
          <div class="stepper-group">
            <button type="button" class="stepper-btn" @click="value.price.to = Math.max(value.price.from, (value.price.to ?? 0) - 1)" aria-label="Уменьшить">−</button>
            <input
              v-model.number="value.price.to"
              type="number"
              :min="value.price.from"
              :max="filterOptions.price.to"
              class="range-input"
            />
            <button type="button" class="stepper-btn" @click="value.price.to = Math.min(filterOptions.price.to, (value.price.to ?? 0) + 1)" aria-label="Увеличить">+</button>
          </div>
        </div>
      </div>

      <div class="space-y-1.5 rounded-box border border-base-300 bg-base-100 p-2.5">
        <label class="label-text block text-sm font-medium text-base-content">Доходность</label>
        <div class="flex flex-col gap-1.5">
          <div class="stepper-group">
            <button type="button" class="stepper-btn" @click="value.bondYield.from = Math.max(filterOptions.bondYield.from, (value.bondYield.from ?? 0) - 1)" aria-label="Уменьшить">−</button>
            <input
              v-model.number="value.bondYield.from"
              type="number"
              :min="filterOptions.bondYield.from"
              :max="value.bondYield.to"
              class="range-input"
            />
            <button type="button" class="stepper-btn" @click="value.bondYield.from = Math.min(value.bondYield.to, (value.bondYield.from ?? 0) + 1)" aria-label="Увеличить">+</button>
          </div>
          <div class="stepper-group">
            <button type="button" class="stepper-btn" @click="value.bondYield.to = Math.max(value.bondYield.from, (value.bondYield.to ?? 0) - 1)" aria-label="Уменьшить">−</button>
            <input
              v-model.number="value.bondYield.to"
              type="number"
              :min="value.bondYield.from"
              :max="filterOptions.bondYield.to"
              class="range-input"
            />
            <button type="button" class="stepper-btn" @click="value.bondYield.to = Math.min(filterOptions.bondYield.to, (value.bondYield.to ?? 0) + 1)" aria-label="Увеличить">+</button>
          </div>
        </div>
      </div>

      <div class="space-y-1.5 rounded-box border border-base-300 bg-base-100 p-2.5">
        <label class="label-text block text-sm font-medium text-base-content">Погашение (мес)</label>
        <div class="flex flex-col gap-1.5">
          <div class="stepper-group">
            <button type="button" class="stepper-btn" @click="value.duration.from = Math.max(filterOptions.duration.from, (value.duration.from ?? 0) - 1)" aria-label="Уменьшить">−</button>
            <input
              v-model.number="value.duration.from"
              type="number"
              :min="filterOptions.duration.from"
              :max="value.duration.to"
              class="range-input"
            />
            <button type="button" class="stepper-btn" @click="value.duration.from = Math.min(value.duration.to, (value.duration.from ?? 0) + 1)" aria-label="Увеличить">+</button>
          </div>
          <div class="stepper-group">
            <button type="button" class="stepper-btn" @click="value.duration.to = Math.max(value.duration.from, (value.duration.to ?? 0) - 1)" aria-label="Уменьшить">−</button>
            <input
              v-model.number="value.duration.to"
              type="number"
              :min="value.duration.from"
              :max="filterOptions.duration.to"
              class="range-input"
            />
            <button type="button" class="stepper-btn" @click="value.duration.to = Math.min(filterOptions.duration.to, (value.duration.to ?? 0) + 1)" aria-label="Увеличить">+</button>
          </div>
        </div>
      </div>
    </section>

    <section class="grid grid-cols-1 gap-3 xl:grid-cols-2 2xl:grid-cols-3">
      <bond-options-select
        v-model="value.currency"
        :options="filterOptions.currency"
        label="Валюта"
      />
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
      <bond-options-checks
        v-model="value.couponMonths"
        :options="filterOptions.couponMonths"
        label="Месяцы купонов"
        group-name="couponMonths"
        size="btn-sm"
      />
    </section>

    <section class="grid grid-cols-1 gap-3 xl:grid-cols-2 2xl:grid-cols-3">
      <div class="space-y-1">
        <label class="label-text block text-sm font-medium text-base-content">Совпадение месяцев</label>
        <div class="flex flex-wrap gap-1">
          <button
            v-for="option in couponMonthsMatchModeOptions"
            :key="option.value"
            type="button"
            class="btn btn-sm"
            :class="value.couponMonthsMatchMode === option.value ? 'btn-primary' : 'btn-outline'"
            @click="value.couponMonthsMatchMode = option.value"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </section>

    <section class="grid grid-cols-1 gap-3 xl:grid-cols-2 2xl:grid-cols-3">
      <bond-options-radios
        v-model="value.forIisFlag"
        label="Доступна для ИИС"
        group-name="forIisFlag"
        size="btn-sm"
      />
      <bond-options-radios
        v-model="value.forQualInvestorFlag"
        label="Для квалов"
        group-name="forQualInvestorFlag"
        size="btn-sm"
      />
      <bond-options-radios
        v-model="value.indexedNominalFlag"
        label="Индексация номинала"
        group-name="indexedNominalFlag"
        size="btn-sm"
      />
      <bond-options-radios
        v-model="value.collateralFlag"
        label="Есть обеспечение"
        group-name="collateralFlag"
        size="btn-sm"
      />
      <bond-options-radios
        v-model="value.taxFreeFlag"
        label="Купоны не облаг. налогом"
        group-name="taxFreeFlag"
        size="btn-sm"
      />
      <bond-options-radios
        v-model="value.floatingCouponFlag"
        label="Плавающий купон"
        group-name="floatingCouponFlag"
        size="btn-sm"
      />
      <bond-options-radios
        v-model="value.amortizationFlag"
        label="С амортизацией"
        group-name="amortizationFlag"
        size="btn-sm"
      />
      <bond-options-checks
        v-model="value.riskLevel"
        :options="filterOptions.riskLevel"
        label="Уровень риска"
        group-name="riskLevel"
        size="btn-sm"
      />
      <bond-options-checks
        v-model="value.liquidity"
        :options="filterOptions.liquidity"
        label="Ликвидность"
        group-name="liquidity"
        size="btn-sm"
      />
    </section>

    <section class="grid grid-cols-1 gap-3 xl:grid-cols-3">
      <bond-options-select
        v-model="value.sector"
        :options="filterOptions.sector"
        label="Сектор"
      />
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

    <section class="grid grid-cols-1 gap-3 xl:grid-cols-3">
      <bond-options-radios
        v-model="value.shortEnabledFlag"
        label="Доступен шорт"
        group-name="shortEnabledFlag"
        size="btn-sm"
      />
      <bond-options-radios
        v-model="value.otcFlag"
        label="Внебиржевая"
        group-name="otcFlag"
        size="btn-sm"
      />
      <bond-options-radios
        v-model="value.buyAvailableFlag"
        label="Доступна для покупки"
        group-name="buyAvailableFlag"
        size="btn-sm"
      />
      <bond-options-radios
        v-model="value.sellAvailableFlag"
        label="Доступна для продажи"
        group-name="sellAvailableFlag"
        size="btn-sm"
      />
      <bond-options-radios
        v-model="value.perpetualFlag"
        label="Бессрочная"
        group-name="perpetualFlag"
        size="btn-sm"
      />
      <bond-options-radios
        v-model="value.apiTradeAvailableFlag"
        label="Доступна торговля по API"
        group-name="apiTradeAvailableFlag"
        size="btn-sm"
      />
      <bond-options-radios
        v-model="value.weekendFlag"
        label="Торговля по выходным"
        group-name="weekendFlag"
        size="btn-sm"
      />
      <bond-options-radios
        v-model="value.blockedTcaFlag"
        label="Блокировка ТКС"
        group-name="blockedTcaFlag"
        size="btn-sm"
      />
      <bond-options-radios
        v-model="value.subordinatedFlag"
        label="Субординированная"
        group-name="subordinatedFlag"
        size="btn-sm"
      />
    </section>
  </div>
</template>

<script lang="ts">
import { BondOptionsChecks, BondOptionsRadios, BondOptionsSelect } from '@/components/UI'
import { type CouponMonthsMatchMode, type FilterValues, type FilterOptions } from '@/data/Types/FilterOptions'
import type { PropType } from 'vue'

const couponMonthsMatchModeOptions: { value: CouponMonthsMatchMode; label: string }[] = [
  { value: 'any', label: 'Хотя бы один' },
  { value: 'all', label: 'Все выбранные' }
]

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
      value: this.modelValue,
      couponMonthsMatchModeOptions
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
.stepper-group {
  display: flex;
  height: 2rem;
  width: 100%;
  overflow: hidden;
  border-radius: 0.375rem;
  border: 1px solid var(--color-base-300);
  background-color: var(--color-base-100);
}
.stepper-group:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 1px color-mix(in oklab, var(--color-primary) 40%, transparent);
}
.stepper-btn {
  display: flex;
  height: 100%;
  width: 2rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border: 0;
  background-color: var(--color-base-200);
  color: var(--color-base-content);
  transition: background-color 150ms ease;
  opacity: 0.75;
}
.stepper-btn:hover {
  background-color: var(--color-base-300);
}
.stepper-btn:focus {
  outline: none;
}
.range-input {
  min-width: 0;
  flex: 1;
  border: 0;
  background: transparent;
  padding: 0.25rem 0.375rem;
  font-size: 0.875rem;
  color: var(--color-base-content);
  outline: none;
}
.range-input::-webkit-inner-spin-button,
.range-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.range-input[type='number'] {
  -moz-appearance: textfield;
}
</style>
