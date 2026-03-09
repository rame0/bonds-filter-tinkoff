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
      success: 'font-semibold text-success',
      danger: 'font-semibold text-error',
      primary: 'font-semibold text-base-content/70'
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
