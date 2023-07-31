<template>
  <el-radio-group v-model="value" size="small" @change="$emit('update:modelValue', $event)">
    <el-radio-button v-for="option in options" :key="option.label as string" :label="option.value">
      {{ option.label }}
    </el-radio-button>
  </el-radio-group>
</template>

<script lang="ts">
import type { PropType } from 'vue'
import { type CollationItem } from '@/data/collations/BaseCollations'

export default {
  name: 'BondOptionsRadios',

  props: {
    options: {
      type: Array as PropType<CollationItem[]>,
      default: () => [
        { label: 'Не важно', value: -1 },
        { label: 'Да', value: true },
        { label: 'Нет', value: false }
      ]
    },
    modelValue: {
      type: [Number, Boolean, String],
      default: undefined
    }
  },

  data() {
    return {
      value: this.modelValue
    }
  }
}
</script>
