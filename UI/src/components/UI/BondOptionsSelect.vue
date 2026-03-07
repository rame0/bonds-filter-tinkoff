<template>
  <div class="space-y-2" ref="rootRef">
    <label v-if="label" class="block text-sm font-medium text-slate-700 dark:text-slate-200">
      {{ label }}
    </label>
    <div class="relative">
      <button
        type="button"
        class="flex min-h-8 w-full items-center justify-between gap-2 rounded border border-slate-300 bg-white px-1.5 py-1 text-left text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-emerald-900"
        :class="{ 'ring-2 ring-emerald-200 dark:ring-emerald-900': isOpen }"
        @click="isOpen = !isOpen"
        aria-haspopup="listbox"
        :aria-expanded="isOpen"
      >
        <span class="truncate">
          {{ summaryText }}
        </span>
        <span class="shrink-0 text-slate-400" aria-hidden="true">
          {{ isOpen ? '▲' : '▼' }}
        </span>
      </button>

      <div
        v-show="isOpen"
        class="absolute top-full left-0 z-30 mt-1 max-h-56 w-full overflow-auto rounded border border-slate-200 bg-white py-0.5 shadow-lg dark:border-slate-700 dark:bg-slate-900"
        role="listbox"
      >
        <button
          v-for="(item, index) in options"
          :key="`${index}-${String(item.value)}`"
          type="button"
          role="option"
          :aria-selected="isSelected(item.value as OptionValue)"
          class="flex w-full items-center gap-2 px-1.5 py-1 text-left text-sm transition hover:bg-slate-100 dark:hover:bg-slate-800"
          :class="isSelected(item.value as OptionValue) ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200' : 'text-slate-700 dark:text-slate-200'"
          @click="toggleOption(item.value as OptionValue)"
        >
          <span
            class="flex h-4 w-4 shrink-0 items-center justify-center rounded border text-xs"
            :class="isSelected(item.value as OptionValue) ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-400 dark:border-slate-500'"
          >
            {{ isSelected(item.value as OptionValue) ? '✓' : '' }}
          </span>
          {{ getOptionLabel(item.label) }}
        </button>
        <p
          v-if="options.length === 0"
          class="px-1.5 py-1 text-sm text-slate-500 dark:text-slate-400"
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
