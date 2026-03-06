<template>
  <div class="flex flex-wrap gap-2">
    <span
      v-for="item in show"
      v-bind:key="item"
      :class="getTagClass(row[item], FlagsCollations.isInverse(item))"
    >
      {{ FlagsCollations.getLabel(item) }}
    </span>
  </div>
</template>

<script lang="ts">
import FlagsCollations from '@/data/collations/FlagsCollations'
import type { PropType } from 'vue'

export default {
  name: 'BondFlags',
  props: {
    row: {
      type: Object,
      required: true
    },
    show: {
      type: Array as PropType<string[]>,
      required: true
    }
  },

  setup() {
    const getTagClass = (value: boolean | undefined, inverse: boolean = false) => {
      const baseClasses =
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"

      if (value === undefined) {
        return `${baseClasses} bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-100`
      } else if (value) {
        return !inverse
          ? `${baseClasses} bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200`
          : `${baseClasses} bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200`
      } else {
        return !inverse
          ? `${baseClasses} bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200`
          : `${baseClasses} bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200`
      }
    }
    return {
      getTagClass,
      FlagsCollations
    }
  }
}
</script>
