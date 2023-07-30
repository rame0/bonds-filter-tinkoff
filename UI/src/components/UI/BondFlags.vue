<template>
  <div>
    <el-tag v-for="item in show" class="mr-2" :type="getTagClass(row[item], FlagsCollations.isInverse(item))">
      {{ FlagsCollations.getLabel(item) }}
    </el-tag>
  </div>
</template>

<script lang="ts">
import FlagsCollations from '@/data/collations/FlagsCollations'

export default {
  name: 'BondFlags',
  props: {
    row: {
      type: Object,
      required: true
    },
    show: {
      type: Array,
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
