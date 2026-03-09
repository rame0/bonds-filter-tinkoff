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
      const baseClasses = 'badge badge-sm'

      if (value === undefined) {
        return `${baseClasses} badge-ghost`
      } else if (value) {
        return !inverse
          ? `${baseClasses} badge-success`
          : `${baseClasses} badge-error`
      } else {
        return !inverse
          ? `${baseClasses} badge-error`
          : `${baseClasses} badge-success`
      }
    }
    return {
      getTagClass,
      FlagsCollations
    }
  }
}
</script>
