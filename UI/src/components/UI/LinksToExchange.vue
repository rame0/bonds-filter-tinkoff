<template>
  <div class="space-y-1">
    <div class="font-medium text-base-content">{{ ticker }}</div>
    <a
      :href="`https://www.tinkoff.ru/invest/bonds/${props.ticker}/`"
      target="_blank"
      rel="noreferrer"
      class="link link-warning inline-flex items-center gap-1 text-sm font-medium no-underline"
    >
      Tinkoff
      <new-window class="h-3 w-3 shrink-0" />
    </a>

    <a
      :href="`https://www.moex.com/ru/issue.aspx?code=${props.ticker}`"
      target="_blank"
      rel="noreferrer"
      class="link link-error inline-flex items-center gap-1 text-sm font-medium no-underline"
      v-if="isMoexExchange"
    >
      МосБиржа
      <new-window class="h-3 w-3 shrink-0" />
    </a>
  </div>
</template>

<script setup lang="ts">
import newWindow from '@/components/icons/IconNewWindow.vue'
import { computed } from 'vue'
import { RealExchange } from '@/data/Interfaces/common'

const props = defineProps<{
  ticker: string
  exchange?: string | number
}>()

const isMoexExchange = computed(() => Number(props.exchange) === RealExchange.REAL_EXCHANGE_MOEX)
</script>
