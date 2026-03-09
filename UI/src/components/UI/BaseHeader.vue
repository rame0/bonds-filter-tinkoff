<template>
	<header class="border-b border-base-300 bg-base-100/90 backdrop-blur">
		<nav class="navbar min-h-[var(--header-height)] gap-3 px-4">
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
					class="badge badge-primary badge-sm"
				>
					{{ store.bondsQty > 99 ? "99+" : store.bondsQty }}
				</span>
			</RouterLink>
			<button
				type="button"
				class="btn btn-outline btn-sm"
				disabled
			>
				Переключение темы (скоро)
			</button>
		</nav>
	</header>
</template>

<script setup lang="ts">
import { RouterLink, useRoute } from "vue-router"
import { portfolioStore } from "@/data/portfolioStore"

const route = useRoute()
const store = portfolioStore()

const navLinkClass = (path: string) => {
	const isActive = route.path === path
	return [
		"btn btn-sm",
		isActive
			? "btn-primary"
			: "btn-ghost"
	]
}
</script>
