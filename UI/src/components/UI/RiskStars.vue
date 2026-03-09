<template>
  <span :class="colorClass">{{ RiskLevelCollation.getLabel(level) }}</span>
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
    const colorByRiskLevel: Record<string, string> = {
      success: 'font-semibold text-success',
      warning: 'font-semibold text-warning',
      danger: 'font-semibold text-error',
      primary: 'font-semibold text-base-content/70'
    }

    return {
      RiskLevelCollation,
      colorByRiskLevel
    }
  },
  computed: {
    colorClass() {
      return this.colorByRiskLevel[RiskLevelCollation.getColorCode(this.level)] || this.colorByRiskLevel.primary
    }
  }
}
</script>
