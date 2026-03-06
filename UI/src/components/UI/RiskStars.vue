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
      success: 'font-semibold text-emerald-600 dark:text-emerald-300',
      warning: 'font-semibold text-amber-600 dark:text-amber-300',
      danger: 'font-semibold text-rose-600 dark:text-rose-300',
      primary: 'font-semibold text-slate-600 dark:text-slate-300'
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
