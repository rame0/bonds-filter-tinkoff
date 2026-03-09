<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="option in options"
      :key="String(option.value)"
      type="button"
      :class="buttonClass(isSelected(option.value as OptionValue))"
      @click="emit('update:modelValue', option.value as OptionValue)"
    >
      {{ getOptionLabel(option.label) }}
    </button>
  </div>
</template>

<script lang="ts" setup>
import { type CollationValueType } from '@/data/collations/BaseCollations'

type OptionValue = number | boolean | string
type OptionItem = {
  label: CollationValueType
  value: OptionValue
}

const props = withDefaults(
  defineProps<{
    options?: OptionItem[]
    modelValue?: OptionValue
  }>(),
  {
    options: () => [
      { label: 'Не важно', value: -1 },
      { label: 'Да', value: true },
      { label: 'Нет', value: false }
    ],
    modelValue: undefined
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: OptionValue): void
}>()

const getOptionLabel = (label: CollationValueType) =>
  typeof label === 'string' ? label : label.name

const isSelected = (value: OptionValue) =>
  props.modelValue === value || String(props.modelValue) === String(value)

const buttonClass = (selected: boolean) =>
  [
    'btn btn-sm',
    selected
      ? 'btn-primary'
      : 'btn-outline'
  ]
</script>
