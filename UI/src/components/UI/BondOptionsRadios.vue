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
    'rounded-full border px-3 py-1.5 text-sm font-medium transition',
    selected
      ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
      : 'border-slate-300 bg-white text-slate-700 hover:border-emerald-500 hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-emerald-400 dark:hover:text-emerald-300'
  ]
</script>
