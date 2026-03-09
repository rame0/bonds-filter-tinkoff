<template>
  <div class="join w-fit">
    <button
      type="button"
      class="join-item btn btn-square btn-xs"
      aria-label="Сбросить"
      @click="emit('update:modelValue', [])"
    >
      ×
    </button>
    <button
      v-for="option in options"
      :key="String(option.value)"
      type="button"
      class="join-item btn btn-xs"
      :class="isSelected(option.value as OptionValue) ? 'btn-primary' : 'btn-ghost bg-base-200 hover:bg-base-300'"
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
</script>
