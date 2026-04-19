import { beforeEach, describe, expect, mock, test } from "bun:test"

const buildBondsDataMock = mock(async () => [{ figi: "figi-1" }])
const shouldStartFetchMock = mock(async () => true)
const markFetchStartedMock = mock(async () => undefined)
const clearFetchMarkerMock = mock(async () => undefined)
let cacheStore = new Map<string, unknown>()

mock.module("file-system-cache", () => ({
	default: () => ({
		get: async (key: string) => cacheStore.get(key),
		set: async (key: string, value: unknown) => {
			cacheStore.set(key, value)
		},
	}),
}))

mock.module("./buildBondsData", () => ({
	buildBondsData: buildBondsDataMock,
}))

mock.module("./fetchGate", () => ({
	shouldStartFetch: shouldStartFetchMock,
	markFetchStarted: markFetchStartedMock,
	clearFetchMarker: clearFetchMarkerMock,
}))

const { getOrBuildBondsData } = await import("./getOrBuildBondsData")

describe("getOrBuildBondsData", () => {
	beforeEach(() => {
		cacheStore = new Map<string, unknown>()
		buildBondsDataMock.mockReset()
		buildBondsDataMock.mockResolvedValue([{ figi: "figi-1" }])
		shouldStartFetchMock.mockReset()
		shouldStartFetchMock.mockResolvedValue(true)
		markFetchStartedMock.mockReset()
		clearFetchMarkerMock.mockReset()
	})

	test("returns cached bonds without starting fetch", async () => {
		cacheStore.set("bonds", [{ figi: "cached" }])

		const result = await getOrBuildBondsData()

		expect(result).toEqual([{ figi: "cached" }])
		expect(shouldStartFetchMock).not.toHaveBeenCalled()
		expect(buildBondsDataMock).not.toHaveBeenCalled()
	})

	test("builds and caches bonds when marker allows fetch", async () => {
		const result = await getOrBuildBondsData()

		expect(shouldStartFetchMock).toHaveBeenCalledTimes(1)
		expect(markFetchStartedMock).toHaveBeenCalledTimes(1)
		expect(buildBondsDataMock).toHaveBeenCalledTimes(1)
		expect(result).toEqual([{ figi: "figi-1" }])
		expect(cacheStore.get("bonds")).toEqual([{ figi: "figi-1" }])
	})

	test("skips fetch when marker is still fresh", async () => {
		shouldStartFetchMock.mockResolvedValueOnce(false)
		cacheStore.set("bonds", [{ figi: "cached" }])

		const result = await getOrBuildBondsData(true)

		expect(result).toEqual([{ figi: "cached" }])
		expect(markFetchStartedMock).not.toHaveBeenCalled()
		expect(buildBondsDataMock).not.toHaveBeenCalled()
	})

	test("returns empty list when marker is fresh and cache is missing", async () => {
		shouldStartFetchMock.mockResolvedValueOnce(false)

		const result = await getOrBuildBondsData(true)

		expect(result).toEqual([])
		expect(markFetchStartedMock).not.toHaveBeenCalled()
		expect(buildBondsDataMock).not.toHaveBeenCalled()
	})

	test("clears marker when build fails", async () => {
		buildBondsDataMock.mockRejectedValueOnce(new Error("boom"))

		await expect(getOrBuildBondsData()).rejects.toThrow("boom")

		expect(markFetchStartedMock).toHaveBeenCalledTimes(1)
		expect(clearFetchMarkerMock).toHaveBeenCalledTimes(1)
	})
})
