<template>
  <div class="space-y-1">
    <label v-if="label" class="label-text block text-sm font-medium text-base-content">
      {{ label }}
    </label>
    <form class="gap-1" @submit.prevent>
      <input
        v-for="option in options"
        :key="String(option.value)"
        :class="['btn', size]"
        type="checkbox"
        :name="groupName"
        :aria-label="String(getOptionLabel(option.label))"
        :checked="isSelected(option.value as OptionValue)"
        @change="toggleOption(option.value as OptionValue)"
      />
      <input
        :class="['btn', 'btn-square', size]"
        type="reset"
        value="×"
        aria-label="Сбросить"
        @click="emit('update:modelValue', [])"
      />
    </form>
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
    label?: string
    groupName?: string
    size?: string
    options?: OptionItem[]
    modelValue?: OptionValue[]
  }>(),
  {
    label: '',
    groupName: 'bond-options',
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
