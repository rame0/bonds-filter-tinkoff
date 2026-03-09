<template>
	<aside
		:class="
			mode === 'horizontal'
				? 'flex items-center gap-3'
				: 'flex min-w-52 flex-col gap-3 border-r border-base-300 p-4'
		"
	>
		<RouterLink :class="linkClass('/')" to="/">Подбор облигаций</RouterLink>
		<RouterLink :class="linkClass('/portfolio')" to="/portfolio">
			<span>Подобранный портфель</span>
			<span
				v-if="store.bondsQty > 0"
				class="badge badge-primary badge-sm"
			>
				{{ store.bondsQty > 99 ? "99+" : store.bondsQty }}
			</span>
		</RouterLink>
		<button
			type="button"
			class="btn btn-ghost btn-sm justify-start"
			@click="toggleTheme()"
		>
			{{ isDarkTheme ? "Светлая тема" : "Тёмная тема" }}
		</button>
	</aside>
</template>

<script lang="ts" setup>
import { RouterLink, useRoute } from "vue-router"
import { portfolioStore } from "@/data/portfolioStore"
import { isDarkTheme, toggleTheme } from "@/composables"

const route = useRoute()
const store = portfolioStore()

withDefaults(
	defineProps<{
		mode?: "horizontal" | "vertical"
	}>(),
	{
		mode: "vertical"
	}
)

const linkClass = (path: string) => {
	const isActive = route.path === path
	return [
		"btn justify-between",
		isActive
			? "btn-primary"
			: "btn-ghost"
	]
}
</script>
