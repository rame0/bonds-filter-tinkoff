<template>
  <div v-if="!settings.apiToken || !settings.accountId">
    <h1>Настройки не заданы</h1>
    <p>
      Пожалуйста, укажите API Token и ID аккаунта в
      <router-link to="/settings">настройках</router-link>
      .
    </p>
  </div>
  <div v-else></div>
</template>

<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings'
import { TinkoffInvestApi } from 'tinkoff-invest-api'

const settings = useSettingsStore()

if (settings.accountId && settings.apiToken) {
  const api = new TinkoffInvestApi({
    token: settings.apiToken,
    appName: 'rame0/bonds-filter-tinkoff'
  })

  const bonds = api.instruments.bonds
  console.log(bonds)
}
</script>
