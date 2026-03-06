<template>
	<header class="border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
		<nav class="flex min-h-[var(--header-height)] flex-wrap items-center gap-3 px-4 py-3">
			<RouterLink
				to="/"
				class="text-lg font-semibold text-slate-900 transition hover:text-emerald-600 dark:text-slate-100"
			>
				Bonds filter (Tinkoff)
			</RouterLink>
			<div class="grow" />
			<RouterLink :class="navLinkClass('/')" to="/">Подбор облигаций</RouterLink>
			<RouterLink :class="navLinkClass('/portfolio')" to="/portfolio">
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
				class="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-500 hover:text-emerald-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-emerald-400 dark:hover:text-emerald-300"
				@click="toggleDark()"
			>
				{{ isDark ? "Тёмная тема" : "Светлая тема" }}
			</button>
		</nav>
	</header>
</template>

<script setup lang="ts">
import { RouterLink, useRoute } from "vue-router"
import { portfolioStore } from "@/data/portfolioStore"
import { isDark, toggleDark } from "@/composables"

const route = useRoute()
const store = portfolioStore()

const navLinkClass = (path: string) => {
	const isActive = route.path === path
	return [
		"inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
		isActive
			? "bg-emerald-600 text-white shadow-sm"
			: "text-slate-700 hover:bg-slate-100 hover:text-emerald-600 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-emerald-300"
	]
}
</script>
