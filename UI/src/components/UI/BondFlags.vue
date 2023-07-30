<template>
  <div>
    <el-tag
      v-for="item in show"
      v-bind:key="item"
      class="mr-2"
      :type="getTagClass(row[item], FlagsCollations.isInverse(item))"
    >
      {{ FlagsCollations.getLabel(item) }}
    </el-tag>
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
      if (value === undefined) {
        return 'info'
      } else if (value) {
        return !inverse ? 'success' : 'danger'
      } else {
        return !inverse ? 'danger' : 'success'
      }
    }
    return {
      getTagClass,
      FlagsCollations
    }
  }
}
</script>

<style scoped></style>
