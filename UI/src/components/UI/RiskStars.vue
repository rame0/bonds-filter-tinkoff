<template>
  <ElText :type="RiskLevelCollation.getColorCode(level)">{{ RiskLevelCollation.getLabel(level) }}</ElText>
</template>

<script lang="ts">
import RiskLevelCollation from '@/data/collations/RiskLevelCollation'

export default {
  props: {
    level: {
      type: Number,
      required: true
    }
  },

  setup() {


    return {
      RiskLevelCollation
    }
  }
}
</script>

<style scoped></style>
