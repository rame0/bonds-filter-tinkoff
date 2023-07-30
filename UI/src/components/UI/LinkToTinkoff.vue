<template>
  <el-link
    :href="`https://www.tinkoff.ru/invest/bonds/${props.ticker}/`"
    target="_blank"
    type="primary"
    class="link"
    :underline="false"
  >
    {{ props.ticker }}
    <el-icon class="icon" :size="10">
      <new-window />
    </el-icon>
  </el-link>
</template>

<script setup lang="ts">
import newWindow from '@/components/icons/IconNewWindow.vue'

const props = defineProps(['ticker'])
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
