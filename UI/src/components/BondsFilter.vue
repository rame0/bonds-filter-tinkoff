<template>
  <!-- create form for filterBond variable -->
  <el-form label-position="top" v-model="value">
    <el-row>
      <!-- search field -->
      <el-col :span="24">
        <el-form-item label="Поиск (название/тикер/figi)">
          <el-input
            v-model="value.search"
            placeholder="Поиск"
            clearable
            @clear="value.search = ''"
          />
        </el-form-item>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="6">
        <el-form-item label="Номинал">
          <el-input-number
            v-model="value.nominal.from"
            class="w-50 m-2"
            size="small"
            :min="filterOptions.nominal.from"
            :max="value.nominal.to"
          />
          <el-input-number
            v-model="value.nominal.to"
            class="w-50 m-2"
            size="small"
            :min="value.nominal.from"
            :max="filterOptions.nominal.to"
          />
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="Цена">
          <el-input-number
            v-model="value.price.from"
            class="w-50 m-2"
            size="small"
            :min="filterOptions.price.from"
            :max="value.price.to"
          />
          <el-input-number
            v-model="value.price.to"
            class="w-50 m-2"
            size="small"
            :min="value.price.from"
            :max="filterOptions.price.to"
          />
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="Доходность">
          <el-input-number
            v-model="value.yield.from"
            class="w-50 m-2"
            size="small"
            :min="filterOptions.yield.from"
            :max="value.yield.to"
          />
          <el-input-number
            v-model="value.yield.to"
            class="w-50 m-2"
            size="small"
            :min="value.yield.from"
            :max="filterOptions.yield.to"
          />
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="Дюрация (мес)">
          <el-input-number
              v-model="value.duration.from"
              class="w-50 m-2"
              size="small"
              :min="filterOptions.duration.from"
              :max="value.duration.to"
          />
          <el-input-number
              v-model="value.duration.to"
              class="w-50 m-2"
              size="small"
              :min="value.duration.from"
              :max="filterOptions.duration.to"
          />
        </el-form-item>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="8">
        <el-form-item>
          <bond-options-select
            v-model="value.currency"
            :options="filterOptions.currency"
            label="Валюта"
          />
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item>
          <bond-options-select
            v-model="value.couponQuantityPerYear"
            :options="filterOptions.couponQuantityPerYear"
            label="Купонов"
          />
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item>
          <bond-options-select
            v-model="value.countryOfRisk"
            :options="filterOptions.countryOfRisk"
            label="Страна"
          />
        </el-form-item>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="8">
        <el-form-item label="Доступна для ИИС">
          <bond-options-radios v-model="value.forIisFlag" />
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="Для квалов">
          <bond-options-radios v-model="value.forQualInvestorFlag" />
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="Индексация номинала">
          <bond-options-radios v-model="value.indexedNominalFlag" />
        </el-form-item>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="8">
        <el-form-item label="Есть обеспечение">
          <bond-options-radios v-model="value.collateralFlag" />
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="Купоны не облаг. налогом">
          <bond-options-radios v-model="value.taxFreeFlag" />
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="Плавающий купон">
          <bond-options-radios v-model="value.floatingCouponFlag" />
        </el-form-item>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="8">
        <el-form-item label="С амортизацией">
          <bond-options-radios v-model="value.amortizationFlag" />
        </el-form-item>
      </el-col>

      <el-col :span="8">
        <el-form-item label="Уровень риска">
          <bond-options-checks v-model="value.riskLevel" :options="filterOptions.riskLevel" />
        </el-form-item>
      </el-col>

      <el-col :span="8">
        <el-form-item label="Ликвидность">
          <bond-options-checks v-model="value.liquidity" :options="filterOptions.liquidity" />
        </el-form-item>
      </el-col>
    </el-row>

    <!--        <el-form-item label="Цена размещения">-->
    <!--          <el-input v-model="value.placementPrice" placeholder="Цена размещения" />-->
    <!--        </el-form-item>-->
    <!--        <el-row>-->
    <!--          <el-col :span="12">-->
    <!--            <el-form-item>-->
    <!--              <bond-options-select-->
    <!--                v-model="value.classCode"-->
    <!--                :options="filterOptions.classCode"-->
    <!--                label="Код класса"-->
    <!--              />-->
    <!--            </el-form-item>-->
    <!--          </el-col>-->
    <!--        </el-row>-->
    <el-row>
      <el-col :span="8">
        <el-form-item>
          <bond-options-select
            v-model="value.sector"
            :options="filterOptions.sector"
            label="Сектор"
          />
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item>
          <bond-options-select
            v-model="value.issueKind"
            :options="filterOptions.issueKind"
            label="Форма выпуска"
          />
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item>
          <bond-options-select
            v-model="value.realExchange"
            :options="filterOptions.realExchange"
            label="Биржа"
          />
        </el-form-item>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="8">
        <el-form-item label="Доступен шорт">
          <bond-options-radios v-model="value.shortEnabledFlag" />
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="Внебиржевая">
          <bond-options-radios v-model="value.otcFlag" />
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="Доступна для покупки">
          <bond-options-radios v-model="value.buyAvailableFlag" />
        </el-form-item>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="8">
        <el-form-item label="Доступна для продажи">
          <bond-options-radios v-model="value.sellAvailableFlag" />
        </el-form-item>
      </el-col>

      <el-col :span="8">
        <el-form-item label="Бессрочная">
          <bond-options-radios v-model="value.perpetualFlag" />
        </el-form-item>
      </el-col>

      <el-col :span="8">
        <el-form-item label="Доступна торговля по API">
          <bond-options-radios v-model="value.apiTradeAvailableFlag" />
        </el-form-item>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="8">
        <el-form-item label="Торговля по выходным">
          <bond-options-radios v-model="value.weekendFlag" />
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="Блокировка ТКС">
          <bond-options-radios v-model="value.blockedTcaFlag" />
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="Субординированная">
          <bond-options-radios v-model="value.subordinatedFlag" />
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
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

<style scoped></style>
