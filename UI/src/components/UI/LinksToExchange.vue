<template>
  <div class="space-y-1">
    <div>{{ ticker }}</div>
    <el-link
      :href="`https://www.tinkoff.ru/invest/bonds/${props.ticker}/`"
      target="_blank"
      type="warning"
      class="inline-flex items-center gap-1 border-b border-dashed no-underline hover:no-underline"
      :underline="false"
    >
      Tinkoff
      <el-icon :size="10">
        <new-window />
      </el-icon>
    </el-link>

    <el-link
      :href="`https://www.moex.com/ru/issue.aspx?code=${props.ticker}`"
      target="_blank"
      type="danger"
      class="inline-flex items-center gap-1 border-b border-dashed no-underline hover:no-underline"
      :underline="false"
      v-if="props.exchange == 1 || props.exchange == '1'"
    >
      МосБиржа
      <el-icon :size="10">
        <new-window />
      </el-icon>
    </el-link>
  </div>
</template>

<script setup lang="ts">
import newWindow from '@/components/icons/IconNewWindow.vue'

const props = defineProps(['ticker', 'exchange'])
</script>

