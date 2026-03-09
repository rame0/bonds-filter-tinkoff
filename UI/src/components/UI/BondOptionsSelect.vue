<template>
  <div class="space-y-2" ref="rootRef">
    <label v-if="label" class="label-text text-sm font-medium text-base-content">
      {{ label }}
    </label>
    <div class="relative">
      <button
        type="button"
        class="btn btn-outline btn-sm min-h-8 h-auto w-full justify-between text-left normal-case"
        :class="{ 'btn-primary': isOpen }"
        @click="isOpen = !isOpen"
        aria-haspopup="listbox"
        :aria-expanded="isOpen"
      >
        <span class="truncate">
          {{ summaryText }}
        </span>
        <span class="shrink-0 opacity-60" aria-hidden="true">
          {{ isOpen ? '▲' : '▼' }}
        </span>
      </button>

      <div
        v-show="isOpen"
        class="absolute top-full left-0 z-30 mt-1 max-h-56 w-full overflow-auto rounded-box border border-base-300 bg-base-100 py-1 shadow-xl"
        role="listbox"
      >
        <button
          v-for="(item, index) in options"
          :key="`${index}-${String(item.value)}`"
          type="button"
          role="option"
          :aria-selected="isSelected(item.value as OptionValue)"
          class="flex w-full items-center gap-2 px-2 py-1.5 text-left text-sm transition hover:bg-base-200"
          :class="isSelected(item.value as OptionValue) ? 'bg-primary/10 text-primary' : 'text-base-content/80'"
          @click="toggleOption(item.value as OptionValue)"
        >
          <span
            class="flex h-4 w-4 shrink-0 items-center justify-center rounded border text-xs"
            :class="isSelected(item.value as OptionValue) ? 'border-primary bg-primary text-primary-content' : 'border-base-content/30'"
          >
            {{ isSelected(item.value as OptionValue) ? '✓' : '' }}
          </span>
          {{ getOptionLabel(item.label) }}
        </button>
        <p
          v-if="options.length === 0"
          class="px-2 py-1 text-sm text-base-content/60"
        >
          Нет вариантов
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
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

const rootRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)

const getOptionLabel = (label: CollationValueType) => {
  if (typeof label === 'string') return label
  if (label !== null && typeof label === 'object' && 'name' in label) return label.name
  return String(label ?? '')
}

const isSameValue = (left: OptionValue, right: OptionValue) =>
  left === right || String(left) === String(right)

const selectedValues = computed(() => props.modelValue ?? [])

const isSelected = (value: OptionValue) =>
  selectedValues.value.some((v) => isSameValue(v, value))

const summaryText = computed(() => {
  const n = selectedValues.value.length
  if (n === 0) return 'Ничего не выбрано'
  if (n === 1) {
    const opt = props.options?.find((o) => isSameValue(o.value as OptionValue, selectedValues.value[0]))
    return opt ? getOptionLabel(opt.label) : '1 выбрано'
  }
  return `${n} выбрано`
})

function toggleOption(value: OptionValue) {
  const current = [...selectedValues.value]
  const idx = current.findIndex((v) => isSameValue(v, value))
  if (idx >= 0) {
    current.splice(idx, 1)
  } else {
    current.push(value)
  }
  emit('update:modelValue', current)
}

function onDocumentClick(e: MouseEvent) {
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

watch(isOpen, (open) => {
  if (open) {
    setTimeout(() => document.addEventListener('click', onDocumentClick), 0)
  } else {
    document.removeEventListener('click', onDocumentClick)
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
})
</script>
