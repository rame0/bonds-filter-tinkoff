<template>
  <div data-theme="night" class="min-h-screen bg-base-200 text-base-content">
    <BaseHeader />
    <main class="flex w-full">
<!--      <BaseSide />-->
      <div class="content w-full">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import BaseHeader from '@/components/UI/BaseHeader.vue'

if (import.meta.env.VITE_METRIKA_ID) {
  const metrika = import('@/utils/metrika')
  const addMetrika = metrika.then((m: any) => {
    return m.default
  })

  addMetrika.then((am) => {
    // noinspection TypeScriptValidateTypes
    am(import.meta.env.VITE_METRIKA_ID)
  })
}
</script>
