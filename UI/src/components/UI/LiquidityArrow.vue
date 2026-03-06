<template>
  <span :class="colorClass">{{ LiquidityCollations.getLabel(level) }}</span>
</template>

<script lang="ts">
import LiquidityCollations from '@/data/collations/LiquidityCollations'

export default {
  props: {
    level: {
      type: Number,
      required: true
    }
  },

  setup() {
    const colorByLiquidity: Record<string, string> = {
      success: 'font-semibold text-emerald-600 dark:text-emerald-300',
      danger: 'font-semibold text-rose-600 dark:text-rose-300',
      primary: 'font-semibold text-slate-600 dark:text-slate-300'
    }

    return {
      LiquidityCollations,
      colorByLiquidity
    }
  },
  computed: {
    colorClass() {
      return this.colorByLiquidity[LiquidityCollations.getColorCode(this.level)] || this.colorByLiquidity.primary
    }
  }
}
</script>
