<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="option in options"
      :key="String(option.value)"
      type="button"
      :class="buttonClass(isSelected(option.value as OptionValue))"
      @click="toggleOption(option.value as OptionValue)"
    >
      {{ getOptionLabel(option.label) }}
    </button>
  </div>
</template>

<script setup lang="ts">
import type { CollationValueType } from '@/data/collations/BaseCollations'

type OptionValue = string | number
type OptionItem = {
  label: CollationValueType
  value: OptionValue
}

const props = withDefaults(
  defineProps<{
    options?: OptionItem[]
    modelValue?: OptionValue[]
  }>(),
  {
    options: () => []
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: OptionValue[]): void
}>()

const getOptionLabel = (label: CollationValueType) =>
  typeof label === 'string' ? label : label.name

const isSameValue = (left: OptionValue, right: OptionValue) =>
  left === right || String(left) === String(right)

const isSelected = (value: OptionValue) =>
  (props.modelValue ?? []).some((selectedValue) => isSameValue(selectedValue, value))

const toggleOption = (value: OptionValue) => {
  const nextValue = [...(props.modelValue ?? [])]
  const selectedIndex = nextValue.findIndex((selectedValue) => isSameValue(selectedValue, value))

  if (selectedIndex >= 0) {
    nextValue.splice(selectedIndex, 1)
  } else {
    nextValue.push(value)
  }

  emit('update:modelValue', nextValue)
}

const buttonClass = (selected: boolean) =>
  [
    'rounded border px-1.5 py-1 text-sm font-medium transition',
    selected
      ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
      : 'border-slate-300 bg-white text-slate-700 hover:border-emerald-500 hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-emerald-400 dark:hover:text-emerald-300'
  ]
</script>
