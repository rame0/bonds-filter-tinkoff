<template>
  <div class="space-y-1">
    <label v-if="label" class="label-text block text-sm font-medium text-base-content">
      {{ label }}
    </label>
    <form class="filter gap-1" @submit.prevent>
      <input
        :class="['btn', 'btn-square', size]"
        type="reset"
        value="×"
        aria-label="Сбросить"
        @click.prevent="emit('update:modelValue', -1)"
      />
      <input
        v-for="option in renderedOptions"
        :key="String(option.value)"
        type="radio"
        :class="['btn', size]"
        :name="groupName"
        :aria-label="getOptionLabel(option.label)"
        :checked="isSelected(option.value as OptionValue)"
        @change="handleChange($event, option.value as OptionValue)"
      />
    </form>
  </div>
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
    label?: string
    groupName?: string
    size?: string
    options?: OptionItem[]
    modelValue?: OptionValue
  }>(),
  {
    label: '',
    groupName: 'bond-options-radios',
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

const handleChange = (event: Event, value: OptionValue) => {
	const target = event.target as HTMLInputElement | null
	if (!target?.checked) {
		return
	}

	emit('update:modelValue', value)
}

const renderedOptions = computed(() =>
  (props.options ?? []).filter((option) => String(option.value) !== '-1')
)
</script>
