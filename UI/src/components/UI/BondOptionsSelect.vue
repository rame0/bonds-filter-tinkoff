<template>
  <el-select
    v-model="value"
    multiple
    :placeholder="label"
    @change="$emit('update:modelValue', $event)"
  >
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label as string"
      :value="item.value"
    />
  </el-select>
</template>

<script lang="ts">
import { type PropType } from 'vue'
import { type CollationItem } from '@/data/collations/BaseCollations'

export default {
  name: 'BondOptionsSelect',

  props: {
    label: {
      type: String,
      default: ''
    },
    options: {
      type: Array as PropType<CollationItem[]>,
      default: () => []
    },
    modelValue: {
      type: Array as PropType<string[] | number[]>
    }
  },

  data() {
    return {
      value: this.modelValue
    }
  }
}
</script>
