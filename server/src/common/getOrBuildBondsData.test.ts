import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test"
import * as buildBondsDataModule from "./buildBondsData"
import { clearCacheEntries } from "./cache"
import * as fetchGate from "./fetchGate"

const buildBondsDataMock = mock(async () => [{ figi: "figi-1" }])
const shouldStartFetchMock = mock(async () => true)
const markFetchStartedMock = mock(async () => undefined)
const clearFetchMarkerMock = mock(async () => undefined)

const { getOrBuildBondsData } = await import("./getOrBuildBondsData")

describe("getOrBuildBondsData", () => {
	beforeEach(() => {
		spyOn(buildBondsDataModule, "buildBondsData").mockImplementation(buildBondsDataMock as any)
		spyOn(fetchGate, "shouldStartFetch").mockImplementation(shouldStartFetchMock as any)
		spyOn(fetchGate, "markFetchStarted").mockImplementation(markFetchStartedMock as any)
		spyOn(fetchGate, "clearFetchMarker").mockImplementation(clearFetchMarkerMock as any)
		clearCacheEntries()
		buildBondsDataMock.mockReset()
		buildBondsDataMock.mockResolvedValue([{ figi: "figi-1" }])
		shouldStartFetchMock.mockReset()
		shouldStartFetchMock.mockResolvedValue(true)
		markFetchStartedMock.mockReset()
		clearFetchMarkerMock.mockReset()
	})

	afterEach(() => {
		mock.restore()
		clearCacheEntries()
	})

	test("returns cached bonds without starting fetch", async () => {
		await import("./cache").then(({ createCache }) => createCache().set("bonds", [{ figi: "cached" }]))

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
		const { createCache } = await import("./cache")
		expect(await createCache().get("bonds")).toEqual([{ figi: "figi-1" }])
	})

	test("skips fetch when marker is still fresh", async () => {
		shouldStartFetchMock.mockResolvedValueOnce(false)
		await import("./cache").then(({ createCache }) => createCache().set("bonds", [{ figi: "cached" }]))

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
