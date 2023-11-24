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

if (import.meta.env.VITE_METRIKA_ID) {
  const metrika = import('@/utils/metrika.ts')
  const addMetrika = metrika.then((m: any) => {
    return m.default
  })

  addMetrika.then((am) => {
    // noinspection TypeScriptValidateTypes
    am(import.meta.env.VITE_METRIKA_ID)
  })
}
</script>
