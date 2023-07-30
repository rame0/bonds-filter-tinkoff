<template>
  <el-menu :router="true" :default-active="$route.path">
    <el-menu-item index="/">
      <el-icon>
        <House />
      </el-icon>
    </el-menu-item>
    <el-menu-item index="/settings">
      <el-icon>
        <Setting />
      </el-icon>
    </el-menu-item>
    <el-menu-item m-t="10" @click="toggleDark()">
      <el-icon>
        <Moon v-if="isDark" />
        <Sunny v-else />
      </el-icon>
    </el-menu-item>
  </el-menu>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { House, Setting, Sunny, Moon } from '@element-plus/icons-vue'
import { toggleDark, isDark } from '@/composables'
import { RouterLink } from 'vue-router'

const isCollapse = ref(true)
const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
</script>
