<template>
	<div class="flex flex-wrap items-center justify-end gap-2">
		<label class="flex items-center gap-2 text-sm text-base-content/70">
			<span class="hidden xl:inline">Портфель</span>
			<select v-model="activePortfolioId" class="select select-bordered select-sm max-w-52">
				<option v-for="portfolio in store.portfolios" :key="portfolio.id" :value="portfolio.id">
					{{ portfolio.name }}
				</option>
			</select>
		</label>

		<button type="button" class="btn btn-ghost btn-sm" title="Новый портфель" @click="createPortfolio">
			Новый
		</button>
		<button type="button" class="btn btn-ghost btn-sm" title="Дублировать портфель" @click="duplicatePortfolio">
			Копия
		</button>
		<button type="button" class="btn btn-ghost btn-sm" title="Переименовать портфель" @click="renamePortfolio">
			Имя
		</button>
		<button
			type="button"
			class="btn btn-ghost btn-sm text-error"
			:disabled="!store.canDeletePortfolios"
			title="Удалить портфель"
			@click="deletePortfolio"
		>
			Удалить
		</button>
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { portfolioStore } from "@/data/portfolioStore"

const store = portfolioStore()

const activePortfolioId = computed({
	get: () => store.activePortfolioId,
	set: (id: string) => store.switchPortfolio(id)
})

const createPortfolio = () => {
	const name = window.prompt("Название нового портфеля", `Портфель ${store.portfolios.length + 1}`)
	if (name === null) {
		return
	}

	store.createPortfolio(name)
}

const renamePortfolio = () => {
	const name = window.prompt("Новое название портфеля", store.activePortfolio.name)
	if (name === null) {
		return
	}

	store.renamePortfolio(store.activePortfolioId, name)
}

const duplicatePortfolio = () => {
	store.duplicatePortfolio(store.activePortfolioId)
}

const deletePortfolio = () => {
	if (!store.canDeletePortfolios) {
		return
	}

	const confirmed = window.confirm(`Удалить портфель «${store.activePortfolio.name}»?`)
	if (!confirmed) {
		return
	}

	store.deletePortfolio(store.activePortfolioId)
}
</script>
