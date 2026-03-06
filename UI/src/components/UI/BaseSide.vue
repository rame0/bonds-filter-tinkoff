<template>
	<aside
		:class="
			mode === 'horizontal'
				? 'flex items-center gap-3'
				: 'flex min-w-52 flex-col gap-3 border-r border-slate-200 p-4 dark:border-slate-800'
		"
	>
		<RouterLink :class="linkClass('/')" to="/">Подбор облигаций</RouterLink>
		<RouterLink :class="linkClass('/portfolio')" to="/portfolio">
			<span>Подобранный портфель</span>
			<span
				v-if="store.bondsQty > 0"
				class="rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-semibold text-white"
			>
				{{ store.bondsQty > 99 ? "99+" : store.bondsQty }}
			</span>
		</RouterLink>
		<button
			type="button"
			class="rounded-lg border border-slate-300 px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:border-emerald-500 hover:text-emerald-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-emerald-400 dark:hover:text-emerald-300"
			@click="toggleDark()"
		>
			{{ isDark ? "Тёмная тема" : "Светлая тема" }}
		</button>
	</aside>
</template>

<script lang="ts" setup>
import { RouterLink, useRoute } from "vue-router"
import { toggleDark, isDark } from "@/composables"
import { portfolioStore } from "@/data/portfolioStore"

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
		"inline-flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
		isActive
			? "bg-emerald-600 text-white shadow-sm"
			: "text-slate-700 hover:bg-slate-100 hover:text-emerald-600 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-emerald-300"
	]
}
</script>
