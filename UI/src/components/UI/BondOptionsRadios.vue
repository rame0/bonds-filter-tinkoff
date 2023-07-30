<template>
  <el-radio-group v-model="value" size="small" @change="$emit('update:modelValue', $event)">
    <el-radio-button v-for="option in options" :key="option.label" :label="option.value">
      {{ option.label }}
    </el-radio-button>
  </el-radio-group>
</template>

<script lang="ts">
export default {
  name: 'BondOptionsRadios',

  props: {
    options: {
      type: Array,
      default: () => [
        { label: 'Не важно', value: -1 },
        { label: 'Да', value: true },
        { label: 'Нет', value: false }
      ]
    },
    modelValue: {
      type: [Boolean, String, Number, undefined],
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
