<template>
  <div>
    <div>{{ ticker }}</div>
    <el-link
      :href="`https://www.tinkoff.ru/invest/bonds/${props.ticker}/`"
      target="_blank"
      type="warning"
      class="link"
      :underline="false"
    >
      Tinkoff
      <el-icon class="icon" :size="10">
        <new-window />
      </el-icon>
    </el-link>

    <el-link
      :href="`https://www.moex.com/ru/issue.aspx?code=${props.ticker}`"
      target="_blank"
      type="danger"
      class="link"
      :underline="false"
      v-if="props.exchange == 1 || props.exchange == '1'"
    >
      МосБиржа
      <el-icon class="icon" :size="10">
        <new-window />
      </el-icon>
    </el-link>
  </div>
</template>

<script setup lang="ts">
import newWindow from '@/components/icons/IconNewWindow.vue'

const props = defineProps(['ticker', 'exchange'])
</script>

<style scoped>
.link {
  border-bottom: 1px dashed;
  text-decoration: none;
}

.link:hover {
  text-decoration: none;
}

.icon {
  margin-left: 5px;
}
</style>
