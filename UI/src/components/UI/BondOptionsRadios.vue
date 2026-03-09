<template>
  <form class="filter gap-1" @submit.prevent>
    <input
      class="btn btn-square btn-xs"
      type="reset"
      value="×"
      aria-label="Сбросить"
      @click.prevent="emit('update:modelValue', -1)"
    />
    <input
      v-for="option in renderedOptions"
      :key="String(option.value)"
      type="radio"
      class="btn btn-xs"
      :name="groupName"
      :aria-label="getOptionLabel(option.label)"
      :checked="isSelected(option.value as OptionValue)"
      @change="emit('update:modelValue', option.value as OptionValue)"
    />
  </form>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
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

const renderedOptions = computed(() =>
  (props.options ?? []).filter((option) => String(option.value) !== '-1')
)

const groupName = `bond-options-radios-${Math.random().toString(36).slice(2, 9)}`
</script>
