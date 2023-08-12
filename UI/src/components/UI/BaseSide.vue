<template>
  <el-menu :router="true" :default-active="$route.path">
    <el-menu-item index="/">
      <el-icon>
        <House />
      </el-icon>
    </el-menu-item>
<!--    <el-menu-item index="/settings">-->
<!--      <el-icon>-->
<!--        <Setting />-->
<!--      </el-icon>-->
<!--    </el-menu-item>-->
    <el-menu-item m-t="10" @click="toggleDark()">
      <el-icon>
        <Moon v-if="isDark" />
        <Sunny v-else />
      </el-icon>
    </el-menu-item>
  </el-menu>
</template>

<script lang="ts" setup>
import { House, Sunny, Moon } from '@element-plus/icons-vue'
import { toggleDark, isDark } from '@/composables'
</script>
