<template>
  <el-checkbox-group v-model="value" size="small" @change="$emit('update:modelValue', $event)">
    <el-checkbox-button v-for="option in options" :key="option.value" :label="option.value">
      {{ option.label }}
    </el-checkbox-button>
  </el-checkbox-group>
</template>

<script lang="ts">
export default {
  name: 'BondOptionsChecks',

  props: {
    options: {
      type: Array,
      default: () => [
        { label: 'Да', value: true },
        { label: 'Нет', value: false }
      ]
    },
    modelValue: {
      type: Array
    }
  },

  data() {
    return {
      value: this.modelValue
    }
  }
}
</script>
