<template>
  <el-select
    v-model="value"
    multiple
    :placeholder="label"
    @change="$emit('update:modelValue', $event)"
  >
    <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
  </el-select>
</template>

<script lang="ts">
export default {
  name: 'BondOptionsSelect',

  props: {
    label: {
      type: String,
      default: ''
    },
    options: {
      type: Array,
      default: () => []
    },
    modelValue: {
      type: [Boolean, String, Number],
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
