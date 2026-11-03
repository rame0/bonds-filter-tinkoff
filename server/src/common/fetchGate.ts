import { FETCH_MARKER_TTL_MS, createCache } from "./cache"

const FETCH_MARKER_CACHE_KEY = "__fetch_marker__"
const FETCH_FAILURE_CACHE_KEY = "__fetch_failure__"
export const FETCH_RETRY_BASE_DELAY_MS = 60 * 1000
export const FETCH_RETRY_MAX_DELAY_MS = 30 * 60 * 1000
const fetchMarkerCache = createCache()

interface FetchFailureState {
	failures: number
	lastFailedAt: number
}

export function getRetryDelayMs(failures: number) {
	return Math.min(FETCH_RETRY_BASE_DELAY_MS * 2 ** Math.max(failures - 1, 0), FETCH_RETRY_MAX_DELAY_MS)
}

export async function shouldStartFetch(now = Date.now()) {
	const failure = await fetchMarkerCache.get<FetchFailureState>(FETCH_FAILURE_CACHE_KEY)
	if (failure && now - failure.lastFailedAt < getRetryDelayMs(failure.failures)) {
		return false
	}

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

export async function markFetchFailed(now = new Date()) {
	const failure = await fetchMarkerCache.get<FetchFailureState>(FETCH_FAILURE_CACHE_KEY)
	await fetchMarkerCache.set(FETCH_FAILURE_CACHE_KEY, {
		failures: (failure?.failures ?? 0) + 1,
		lastFailedAt: now.getTime(),
	} satisfies FetchFailureState)
	await clearFetchMarker()
}

export async function markFetchSucceeded() {
	await fetchMarkerCache.delete(FETCH_FAILURE_CACHE_KEY)
}

export function getFetchMarkerCacheKey() {
	return FETCH_MARKER_CACHE_KEY
}
