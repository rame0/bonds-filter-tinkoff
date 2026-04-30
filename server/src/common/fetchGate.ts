import { FETCH_MARKER_TTL_MS, createCache } from "./cache"

const FETCH_MARKER_CACHE_KEY = "__fetch_marker__"
const fetchMarkerCache = createCache()

export async function shouldStartFetch(now = Date.now()) {
	const startedAt = await fetchMarkerCache.get<number>(FETCH_MARKER_CACHE_KEY)
	if (typeof startedAt !== "number") {
		return true
	}

	return now - startedAt >= FETCH_MARKER_TTL_MS
}

export async function markFetchStarted(now = new Date()) {
	await fetchMarkerCache.set(FETCH_MARKER_CACHE_KEY, now.getTime())
}

export async function clearFetchMarker() {
	await fetchMarkerCache.delete(FETCH_MARKER_CACHE_KEY)
}

export function getFetchMarkerCacheKey() {
	return FETCH_MARKER_CACHE_KEY
}
