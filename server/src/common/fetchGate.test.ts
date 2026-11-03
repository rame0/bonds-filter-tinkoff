import { beforeEach, describe, expect, test } from "bun:test"
import { clearCacheEntries, createCache, FETCH_MARKER_TTL_MS } from "./cache"

const {
	clearFetchMarker,
	FETCH_RETRY_BASE_DELAY_MS,
	FETCH_RETRY_MAX_DELAY_MS,
	getFetchMarkerCacheKey,
	getRetryDelayMs,
	markFetchFailed,
	markFetchStarted,
	markFetchSucceeded,
	shouldStartFetch,
} = await import("./fetchGate")

describe("fetchGate", () => {
	beforeEach(() => {
		clearCacheEntries()
	})

	test("starts fetch when marker is missing", async () => {
		expect(await shouldStartFetch()).toBe(true)
	})

	test("skips fetch when marker is fresh", async () => {
		await markFetchStarted(new Date(Date.now() - 1_000))

		expect(await shouldStartFetch()).toBe(false)
	})

	test("starts fetch when marker is stale", async () => {
		await markFetchStarted(new Date(Date.now() - FETCH_MARKER_TTL_MS - 1))

		expect(await shouldStartFetch()).toBe(true)
	})

	test("stores marker in SQLite cache", async () => {
		const now = new Date("2026-04-19T10:00:00.000Z")

		await markFetchStarted(now)

		const cache = createCache()
		expect(await cache.get(getFetchMarkerCacheKey())).toBe(now.getTime())
	})

	test("removes marker on fetch failure", async () => {
		await markFetchStarted(new Date())
		await clearFetchMarker()

		const cache = createCache()
		expect(await cache.get(getFetchMarkerCacheKey())).toBeUndefined()
	})

	test("doubles retry delay after each failure up to the limit", () => {
		expect(getRetryDelayMs(1)).toBe(FETCH_RETRY_BASE_DELAY_MS)
		expect(getRetryDelayMs(2)).toBe(FETCH_RETRY_BASE_DELAY_MS * 2)
		expect(getRetryDelayMs(3)).toBe(FETCH_RETRY_BASE_DELAY_MS * 4)
		expect(getRetryDelayMs(100)).toBe(FETCH_RETRY_MAX_DELAY_MS)
	})

	test("waits before retrying after failure", async () => {
		const failedAt = new Date("2026-11-03T10:00:00.000Z")
		await markFetchStarted(failedAt)
		await markFetchFailed(failedAt)

		expect(await shouldStartFetch(failedAt.getTime() + FETCH_RETRY_BASE_DELAY_MS - 1)).toBe(false)
		expect(await shouldStartFetch(failedAt.getTime() + FETCH_RETRY_BASE_DELAY_MS)).toBe(true)
	})

	test("increases retry delay after repeated failures", async () => {
		const firstFailure = new Date("2026-11-03T10:00:00.000Z")
		const secondFailure = new Date(firstFailure.getTime() + FETCH_RETRY_BASE_DELAY_MS)
		await markFetchFailed(firstFailure)
		await markFetchFailed(secondFailure)

		expect(await shouldStartFetch(secondFailure.getTime() + FETCH_RETRY_BASE_DELAY_MS)).toBe(false)
		expect(await shouldStartFetch(secondFailure.getTime() + FETCH_RETRY_BASE_DELAY_MS * 2)).toBe(true)
	})

	test("resets retry delay after success", async () => {
		const failedAt = new Date("2026-11-03T10:00:00.000Z")
		await markFetchFailed(failedAt)
		await markFetchSucceeded()

		expect(await shouldStartFetch(failedAt.getTime() + 1)).toBe(true)
	})
})
