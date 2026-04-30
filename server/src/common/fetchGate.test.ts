import { beforeEach, describe, expect, test } from "bun:test"
import { clearCacheEntries, createCache, FETCH_MARKER_TTL_MS } from "./cache"

const { clearFetchMarker, getFetchMarkerCacheKey, markFetchStarted, shouldStartFetch } = await import("./fetchGate")

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
})
