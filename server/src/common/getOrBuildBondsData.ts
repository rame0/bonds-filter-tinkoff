import Cache from "file-system-cache"
import { buildBondsData } from "./buildBondsData"
import { CombinedBondsResponse } from "./interfaces/CombinedBondsResponse"

const cache = Cache({ ttl: 60 * 60 * 4 })
let inFlightBuild: Promise<CombinedBondsResponse[]> | null = null

export async function getCachedBondsData() {
  const cached = await cache.get("bonds")
  return Array.isArray(cached) && cached.length > 0 ? (cached as CombinedBondsResponse[]) : null
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
    const built = await buildBondsData()
    await cache.set("bonds", built)
    return built
  })()

  try {
    return await inFlightBuild
  } finally {
    inFlightBuild = null
  }
}
