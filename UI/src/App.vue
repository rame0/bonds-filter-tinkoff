<template>
  <ElConfigProvider namespace="ep">
    <div>
      <BaseHeader />
      <main style="display: flex" w="full">
        <BaseSide />
        <div class="content" w="full">
          <RouterView />
        </div>
      </main>
    </div>
  </ElConfigProvider>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { ElConfigProvider } from 'element-plus'
import BaseHeader from '@/components/UI/BaseHeader.vue'


</script>
