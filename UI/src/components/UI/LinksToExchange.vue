<template>
  <div class="space-y-1">
    <div class="font-medium text-slate-800 dark:text-slate-100">{{ ticker }}</div>
    <a
      :href="`https://www.tinkoff.ru/invest/bonds/${props.ticker}/`"
      target="_blank"
      rel="noreferrer"
      class="inline-flex items-center gap-1 border-b border-dashed border-amber-500 text-sm font-medium text-amber-600 no-underline transition hover:text-amber-500"
    >
      Tinkoff
      <new-window class="h-3 w-3 shrink-0" />
    </a>

    <a
      :href="`https://www.moex.com/ru/issue.aspx?code=${props.ticker}`"
      target="_blank"
      rel="noreferrer"
      class="inline-flex items-center gap-1 border-b border-dashed border-rose-500 text-sm font-medium text-rose-600 no-underline transition hover:text-rose-500"
      v-if="props.exchange == 1 || props.exchange == '1'"
    >
      МосБиржа
      <new-window class="h-3 w-3 shrink-0" />
    </a>
  </div>
</template>

<script setup lang="ts">
import newWindow from '@/components/icons/IconNewWindow.vue'

const props = defineProps<{
  ticker: string
  exchange: string | number
}>()
</script>

