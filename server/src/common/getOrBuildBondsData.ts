import * as buildBondsDataModule from "./buildBondsData"
import { createCache } from "./cache"
import * as fetchGate from "./fetchGate"
import { BondsDataStatus } from "./interfaces/BondsDataStatus"
import { CombinedBondsResponse } from "./interfaces/CombinedBondsResponse"

const cache = createCache({ ttl: 60 * 60 * 4 })
let inFlightBuild: Promise<CombinedBondsResponse[]> | null = null
let lastBuildStartedAt: string | undefined
let lastBuildCompletedAt: string | undefined

export async function getCachedBondsData() {
  const cached = await cache.get("bonds")
  return Array.isArray(cached) && cached.length > 0 ? (cached as CombinedBondsResponse[]) : null
}

export async function getBondsDataStatus(): Promise<BondsDataStatus> {
	const cached = await getCachedBondsData()
	const isBuilding = inFlightBuild !== null

	return {
		isBuilding,
		hasCachedData: cached !== null,
		lastBuildStartedAt,
		lastBuildCompletedAt,
		message: isBuilding
			? "Идет обновление данных, пожалуйста, подождите. Обычно это занимает не более 10 минут."
			: undefined,
	}
}

export async function ensureBondsDataBuild() {
	const cached = await getCachedBondsData()
	if (!cached && !inFlightBuild && await fetchGate.shouldStartFetch()) {
		void getOrBuildBondsData(true)
	}
}

export async function getOrBuildBondsData(forceRebuild = false) {
  const cached = await getCachedBondsData()
  if (!forceRebuild && cached) {
    return cached
  }

  if (inFlightBuild) {
    return inFlightBuild
  }

	const shouldFetch = await fetchGate.shouldStartFetch()
  if (!shouldFetch) {
	  return cached ?? []
  }

	await fetchGate.markFetchStarted()

  inFlightBuild = (async () => {
	  lastBuildStartedAt = new Date().toISOString()
	  try {
			const built = await buildBondsDataModule.buildBondsData()
			await cache.set("bonds", built)
		  lastBuildCompletedAt = new Date().toISOString()
		  return built
	  } catch (error) {
			await fetchGate.clearFetchMarker()
		  throw error
	  }
  })()

  try {
    return await inFlightBuild
  } finally {
    inFlightBuild = null
  }
}
