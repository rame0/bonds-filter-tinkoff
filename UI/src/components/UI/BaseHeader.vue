<template>
	<el-menu :router="true" :default-active="$route.path" mode="horizontal" :ellipsis="false">
		<el-menu-item index="/"> Bonds filter (Tinkoff)</el-menu-item>
		<div class="grow" />

		<el-menu-item index="/"> Подбор облигаций</el-menu-item>
		<el-menu-item index="/portfolio">
			Подобранный портфель
			<el-tag>
				{{ portfolioStore().bondsQty }}
			</el-tag>
		</el-menu-item>
		<!--    <el-menu-item index="/settings">-->
		<!--      <el-icon>-->
		<!--        <Setting />-->
		<!--      </el-icon>-->
		<!--    </el-menu-item>-->
		<el-menu-item @click="toggleDark()">
			<el-icon>
				<Moon v-if="isDark" />
				<Sunny v-else />
			</el-icon>
		</el-menu-item>
	</el-menu>
</template>

<script setup>
import { portfolioStore } from "@/data/portfolioStore"
import { isDark, toggleDark } from "@/composables"
import { House, Moon, Suitcase, Sunny } from "@element-plus/icons-vue"
</script>
