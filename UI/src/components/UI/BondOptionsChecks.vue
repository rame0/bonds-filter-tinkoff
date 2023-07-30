<template>
  <el-radio-group v-model="value" size="small" @change="$emit('update:modelValue', $event)">
    <el-radio-button v-for="option in options" :key="option.label" :label="option.value">
      {{ option.label }}
    </el-radio-button>
    <!--    <el-radio-button :label="undefined">Не важно</el-radio-button>-->
    <!--    <el-radio-button :label="true">Да</el-radio-button>-->
    <!--    <el-radio-button :label="false">Нет</el-radio-button>-->
  </el-radio-group>
</template>

<script lang="ts">
export default {
  name: 'RadioGroup',

  props: {
    options: {
      type: Array,
      default: () => [
        { label: 'Не важно', value: undefined },
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
