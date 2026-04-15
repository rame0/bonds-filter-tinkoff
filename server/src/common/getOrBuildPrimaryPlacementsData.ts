import Cache from "file-system-cache"
import { buildPrimaryPlacementsData } from "./buildPrimaryPlacementsData"
import type { BondsDataStatus } from "./interfaces/BondsDataStatus"
import type { PrimaryPlacement } from "./interfaces/PrimaryPlacement"

const cache = Cache({ ttl: 60 * 60 })
let inFlightBuild: Promise<PrimaryPlacement[]> | null = null
let lastBuildStartedAt: string | undefined
let lastBuildCompletedAt: string | undefined

export async function getCachedPrimaryPlacementsData() {
	const cached = await cache.get("primary-placements")
	return Array.isArray(cached) ? cached as PrimaryPlacement[] : null
}

export async function getPrimaryPlacementsDataStatus(): Promise<BondsDataStatus> {
	const cached = await getCachedPrimaryPlacementsData()
	const isBuilding = inFlightBuild !== null

	return {
		isBuilding,
		hasCachedData: cached !== null,
		lastBuildStartedAt,
		lastBuildCompletedAt,
		message: isBuilding
			? "Идет обновление подборки первичных размещений. Обычно это занимает не более минуты."
			: undefined,
	}
}

export async function ensurePrimaryPlacementsDataBuild() {
	const cached = await getCachedPrimaryPlacementsData()
	if (!cached && !inFlightBuild) {
		void getOrBuildPrimaryPlacementsData(true)
	}
}

export async function getOrBuildPrimaryPlacementsData(forceRebuild = false) {
	if (!forceRebuild) {
		const cached = await getCachedPrimaryPlacementsData()
		if (cached) {
			return cached
		}
	}

	if (inFlightBuild) {
		return inFlightBuild
	}

	inFlightBuild = (async () => {
		lastBuildStartedAt = new Date().toISOString()
		const built = await buildPrimaryPlacementsData()
		await cache.set("primary-placements", built)
		lastBuildCompletedAt = new Date().toISOString()
		return built
	})()

	try {
		return await inFlightBuild
	} finally {
		inFlightBuild = null
	}
}
