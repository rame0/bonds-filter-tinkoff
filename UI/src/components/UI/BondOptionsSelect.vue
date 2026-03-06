<template>
  <div class="space-y-2">
    <label v-if="label" class="block text-sm font-medium text-slate-700 dark:text-slate-200">
      {{ label }}
    </label>
    <select
      multiple
      class="min-h-32 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-emerald-900"
      :value="selectedIndexes"
      @change="handleChange"
    >
      <option
        v-for="(item, index) in options"
        :key="`${index}-${String(item.value)}`"
        :value="String(index)"
      >
        {{ getOptionLabel(item.label) }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CollationValueType } from '@/data/collations/BaseCollations'

type OptionValue = string | number
type OptionItem = {
  label: CollationValueType
  value: OptionValue
}

const props = withDefaults(
  defineProps<{
    label?: string
    options?: OptionItem[]
    modelValue?: OptionValue[]
  }>(),
  {
    label: '',
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

const selectedIndexes = computed(() =>
  props.options.reduce<string[]>((indexes, option, index) => {
    const isSelected = (props.modelValue ?? []).some((value) => isSameValue(value, option.value as OptionValue))

    if (isSelected) {
      indexes.push(String(index))
    }

    return indexes
  }, [])
)

const handleChange = (event: Event) => {
  const selected = Array.from((event.target as HTMLSelectElement).selectedOptions)
    .map((option) => props.options[Number(option.value)]?.value)
    .filter((value): value is OptionValue => value !== undefined)

  emit('update:modelValue', selected)
}
</script>
