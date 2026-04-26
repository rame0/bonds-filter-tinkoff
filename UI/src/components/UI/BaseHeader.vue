<template>
	<header class="border-b border-base-300 bg-base-100/90 backdrop-blur">
		<nav class="navbar min-h-[var(--header-height)] flex-wrap gap-3 px-4 py-2">
			<RouterLink
				to="/"
				class="text-lg font-semibold text-base-content transition hover:text-primary"
			>
				Bonds filter (Tinkoff)
			</RouterLink>
			<div class="grow" />
			<RouterLink :class="navLinkClass('/')" to="/">Подбор облигаций</RouterLink>
			<RouterLink :class="navLinkClass('/portfolio')" to="/portfolio">
				<span>Подобранный портфель</span>
				<span
					v-if="store.bondsQty > 0"
					class="badge badge-neutral badge-sm"
				>
					{{ store.bondsQty > 99 ? "99+" : store.bondsQty }}
				</span>
			</RouterLink>
			<portfolio-switcher />
			<button
				type="button"
				class="btn btn-ghost btn-square btn-sm"
				:aria-label="isDarkTheme ? 'Включить светлую тему' : 'Включить тёмную тему'"
				:title="isDarkTheme ? 'Светлая тема' : 'Тёмная тема'"
				@click="toggleTheme()"
			>
				<span v-if="isDarkTheme" aria-hidden="true">☀</span>
				<span v-else aria-hidden="true">☾</span>
			</button>
		</nav>
	</header>
</template>

<script setup lang="ts">
import { RouterLink, useRoute } from "vue-router"
import { portfolioStore } from "@/data/portfolioStore"
import { isDarkTheme, toggleTheme } from "@/composables"

const route = useRoute()
const store = portfolioStore()

const navLinkClass = (path: string) => {
	const isActive = route.path === path
	return [
		"btn btn-sm border border-transparent",
		isActive
			? "btn-ghost border-base-300 bg-base-200 text-base-content"
			: "btn-ghost text-base-content/80 hover:text-base-content"
	]
}
</script>
