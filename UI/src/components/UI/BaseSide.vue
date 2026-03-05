<template>
	<el-menu :router="true" :default-active="$route.path" :mode="mode">
		<el-menu-item index="/">
			<el-tooltip content="Подбор облигаций">
				<el-icon>
					<House />
				</el-icon>
			</el-tooltip>
		</el-menu-item>

		<el-menu-item index="/portfolio">
			<el-tooltip content="Подобранный портфель">
				<el-icon>
					<el-badge
						:value="portfolioStore().bondsQty"
						class="item"
						type="primary"
						:max="99"
						:hidden="portfolioStore().isEmpty"
					>
						<Suitcase />
					</el-badge>
				</el-icon>
			</el-tooltip>
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
import { House, Sunny, Moon, Suitcase } from "@element-plus/icons-vue"
import { toggleDark, isDark } from "@/composables"
import { portfolioStore } from "@/data/portfolioStore"

defineProps({
	mode: {
		type: String,
		default: "vertical"
	}
})
</script>
