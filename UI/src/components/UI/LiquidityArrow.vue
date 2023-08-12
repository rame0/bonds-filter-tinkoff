<template>
  <ElText :type="LiquidityCollations.getColorCode(level)">{{
    LiquidityCollations.getLabel(level)
  }}</ElText>
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
    return {
      LiquidityCollations
    }
  }
}
</script>

<style scoped></style>
