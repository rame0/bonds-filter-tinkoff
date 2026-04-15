<template>
	<div class="space-y-5 px-4 py-5">
		<section class="card card-border bg-base-100">
			<div class="card-body gap-4">
				<div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
					<div class="space-y-2">
						<h1 class="text-2xl font-semibold text-base-content">Первичка без торгов</h1>
						<p class="max-w-3xl text-sm text-base-content/70">
							Показываем облигации, которые уже видны в каталоге Т-Банка, но еще не имеют признаков стартовавших торгов.
							Список полезный, но не гарантированно полный.
						</p>
					</div>
					<div class="stats stats-vertical border border-base-300 shadow-sm sm:stats-horizontal">
						<div class="stat">
							<div class="stat-title">Кандидатов</div>
							<div class="stat-value text-primary">{{ placements.length }}</div>
						</div>
						<div class="stat">
							<div class="stat-title">Статус</div>
							<div class="stat-value text-lg">{{ isPolling ? 'Обновляется' : 'Готово' }}</div>
						</div>
						<div class="stat" v-if="lastBuildCompletedAtLabel">
							<div class="stat-title">Последнее обновление</div>
							<div class="stat-value text-lg">{{ lastBuildCompletedAtLabel }}</div>
						</div>
					</div>
				</div>

				<div v-if="showUpdateNotice" class="rounded-box border border-dashed border-base-300 bg-base-200/50 px-4 py-6 text-center">
					<div class="mb-3 flex justify-center">
						<span class="loading loading-spinner loading-lg text-primary"></span>
					</div>
					<p class="font-medium text-base-content">{{ updateMessage }}</p>
					<p class="mt-2 text-sm text-base-content/60">Проверяем готовность автоматически каждые 10 секунд.</p>
				</div>
			</div>
		</section>

		<section v-if="!showUpdateNotice" class="card card-border bg-base-100">
			<div class="card-body p-0">
				<div class="overflow-x-auto">
					<table class="table table-zebra min-w-[1200px]">
						<thead>
							<tr>
								<th>Название</th>
								<th>Тикер</th>
								<th>Дата размещения</th>
								<th>Цена размещения</th>
								<th>План выпуска</th>
								<th>Статус торгов</th>
								<th>Причина попадания</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="placement in placements" :key="placement.uid">
								<td>
									<div class="font-medium text-base-content">{{ placement.name }}</div>
									<div class="mt-1 text-xs text-base-content/60">{{ placement.isin || 'ISIN не указан' }}</div>
								</td>
								<td>
									<links-to-exchange :ticker="placement.ticker" :exchange="placement.realExchange" />
								</td>
								<td>{{ formatDate(placement.placementDate) }}</td>
								<td>{{ formatMoney(placement.placementPrice, placement.currency) }}</td>
								<td>{{ formatIssueSize(placement.issueSizePlan) }}</td>
								<td>
									<div class="badge badge-outline">{{ placement.tradingStatusLabel }}</div>
								</td>
								<td class="max-w-md text-sm text-base-content/70">{{ placement.primaryReason }}</td>
							</tr>
							<tr v-if="placements.length === 0">
								<td colspan="7">
									<div class="px-4 py-10 text-center text-base-content/70">
										Сейчас кандидатов не найдено.
									</div>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</section>
	</div>
</template>

<script lang="ts">
import { computed, onBeforeUnmount, ref } from "vue"
import type { BondsDataStatus } from "@/data/Interfaces/BondsDataStatus"
import type { PrimaryPlacement } from "@/data/Interfaces/PrimaryPlacement"
import PrimaryRepository from "@/data/PrimaryRepository"
import LinksToExchange from "@/components/UI/LinksToExchange.vue"
import CurrencyCollation from "@/data/collations/CurrencyCollation"

const STATUS_POLL_INTERVAL_MS = 10_000

export default {
	name: "PrimaryView",
	components: {
		LinksToExchange,
	},
	setup() {
		const primaryRepository = new PrimaryRepository()
		const placements = ref<PrimaryPlacement[]>([])
		const status = ref<BondsDataStatus | null>(null)
		const isPolling = ref(false)
		let statusPollTimer: ReturnType<typeof setTimeout> | undefined

		const showUpdateNotice = computed(() => {
			if (!status.value) {
				return true
			}

			return status.value.isBuilding || !status.value.hasCachedData
		})

		const updateMessage = computed(() => status.value?.message ?? "Идет обновление подборки первички.")
		const lastBuildCompletedAtLabel = computed(() => {
			if (!status.value?.lastBuildCompletedAt) {
				return ""
			}

			return new Date(status.value.lastBuildCompletedAt).toLocaleString("ru-RU")
		})

		const clearStatusPoll = () => {
			if (statusPollTimer) {
				clearTimeout(statusPollTimer)
				statusPollTimer = undefined
			}
		}

		const scheduleStatusPoll = () => {
			clearStatusPoll()
			statusPollTimer = setTimeout(() => {
				void ensureDataReady()
			}, STATUS_POLL_INTERVAL_MS)
		}

		const fetchPlacements = async () => {
			placements.value = await primaryRepository.list()
		}

		const ensureDataReady = async () => {
			isPolling.value = true
			try {
				status.value = await primaryRepository.status()
				if (status.value.isBuilding || !status.value.hasCachedData) {
					scheduleStatusPoll()
					return
				}

				clearStatusPoll()
				await fetchPlacements()
			} finally {
				isPolling.value = false
			}
		}

		onBeforeUnmount(() => {
			clearStatusPoll()
		})

		const formatDate = (value?: Date | string) => {
			if (!value) {
				return "—"
			}

			return new Date(value).toLocaleDateString("ru-RU")
		}

		const formatMoney = (value?: number, currency?: string) => {
			if (value === undefined || value === null) {
				return "—"
			}

			const currencyLabel = currency ? CurrencyCollation.getLabel(currency) : ""
			return `${value} ${currencyLabel}`.trim()
		}

		const formatIssueSize = (value?: number) => {
			if (!value) {
				return "—"
			}

			return new Intl.NumberFormat("ru-RU").format(value)
		}

		return {
			placements,
			isPolling,
			showUpdateNotice,
			updateMessage,
			lastBuildCompletedAtLabel,
			formatDate,
			formatMoney,
			formatIssueSize,
			ensureDataReady,
		}
	},
	mounted() {
		this.ensureDataReady()
	},
}
</script>
