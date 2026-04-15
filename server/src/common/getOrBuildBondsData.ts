import Cache from "file-system-cache"
import { buildBondsData } from "./buildBondsData"
import { BondsDataStatus } from "./interfaces/BondsDataStatus"
import { CombinedBondsResponse } from "./interfaces/CombinedBondsResponse"

const cache = Cache({ ttl: 60 * 60 * 4 })
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
	if (!cached && !inFlightBuild) {
		void getOrBuildBondsData(true)
	}
}

export async function getOrBuildBondsData(forceRebuild = false) {
  if (!forceRebuild) {
    const cached = await getCachedBondsData()
    if (cached) {
      return cached
    }
  }

  if (inFlightBuild) {
    return inFlightBuild
  }

  inFlightBuild = (async () => {
	  lastBuildStartedAt = new Date().toISOString()
    const built = await buildBondsData()
    await cache.set("bonds", built)
	  lastBuildCompletedAt = new Date().toISOString()
    return built
  })()

  try {
    return await inFlightBuild
  } finally {
    inFlightBuild = null
  }
}
