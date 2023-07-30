<template>
  <div class="el-loading-mask" style="display: flex; align-items: center; justify-content: center">
    <el-icon class="is-loading" color="var(--el-color-primary)" :size="46">
<!--      <Loading />-->
    </el-icon>
  </div>
</template>

<script setup lang="ts">
import { Loading } from '@element-plus/icons-vue'
</script>

<style>
.ep-table-v2__overlay {
  z-index: 9;

  background: repeating-linear-gradient(
      -45deg,
      rgba(255, 255, 255, 0.1),
      rgba(255, 255, 255, 0.1) 10px,
      rgba(0, 0, 0, 0.1) 10px,
      rgba(0, 0, 0, 0.1) 20px
    ) -100px 0 / 200% 100%;
  -webkit-mask-image: linear-gradient(#000, transparent);
  animation: loading 0.5s infinite linear;
}

@keyframes loading {
  100% {
    background-position: -128px 0;
  }
}

.el-loading-mask {
  position: absolute;
  z-index: 2000;
  background-color: var(--el-mask-color);
  margin: 0;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transition: opacity var(--el-transition-duration);
}
</style>
