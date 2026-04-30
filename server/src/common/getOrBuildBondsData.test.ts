import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test"
import { clearCacheEntries } from "./cache"
import * as bondDataSnapshotModule from "./bondDataSnapshot"
import * as fetchGate from "./fetchGate"
import * as syncBondDataModule from "./syncBondData"

const syncAllBondDataMock = mock(async () => ({ total: 1 }))
const loadStoredBondsMock = mock(() => [{ figi: "figi-1" }])
const getStoredBondCountMock = mock(() => 0)
const shouldStartFetchMock = mock(async () => true)
const markFetchStartedMock = mock(async () => undefined)
const clearFetchMarkerMock = mock(async () => undefined)

const { getOrBuildBondsData } = await import("./getOrBuildBondsData")

describe("getOrBuildBondsData", () => {
	beforeEach(() => {
		spyOn(syncBondDataModule, "syncAllBondData").mockImplementation(syncAllBondDataMock as any)
		spyOn(bondDataSnapshotModule, "loadStoredBonds").mockImplementation(loadStoredBondsMock as any)
		spyOn(bondDataSnapshotModule, "getStoredBondCount").mockImplementation(getStoredBondCountMock as any)
		spyOn(fetchGate, "shouldStartFetch").mockImplementation(shouldStartFetchMock as any)
		spyOn(fetchGate, "markFetchStarted").mockImplementation(markFetchStartedMock as any)
		spyOn(fetchGate, "clearFetchMarker").mockImplementation(clearFetchMarkerMock as any)
		clearCacheEntries()
		syncAllBondDataMock.mockReset()
		syncAllBondDataMock.mockResolvedValue({ total: 1 })
		loadStoredBondsMock.mockReset()
		loadStoredBondsMock.mockReturnValue([{ figi: "figi-1" }])
		getStoredBondCountMock.mockReset()
		getStoredBondCountMock.mockReturnValue(0)
		shouldStartFetchMock.mockReset()
		shouldStartFetchMock.mockResolvedValue(true)
		markFetchStartedMock.mockReset()
		clearFetchMarkerMock.mockReset()
	})

	afterEach(() => {
		mock.restore()
		clearCacheEntries()
	})

	test("returns stored bonds without starting fetch", async () => {
		getStoredBondCountMock.mockReturnValueOnce(1)
		loadStoredBondsMock.mockReturnValueOnce([{ figi: "cached" }])

		const result = await getOrBuildBondsData()

		expect(result).toEqual([{ figi: "cached" }])
		expect(shouldStartFetchMock).not.toHaveBeenCalled()
		expect(syncAllBondDataMock).not.toHaveBeenCalled()
	})

	test("builds bonds when marker allows fetch", async () => {
		const result = await getOrBuildBondsData()

		expect(shouldStartFetchMock).toHaveBeenCalledTimes(1)
		expect(markFetchStartedMock).toHaveBeenCalledTimes(1)
		expect(syncAllBondDataMock).toHaveBeenCalledTimes(1)
		expect(loadStoredBondsMock).toHaveBeenCalledTimes(1)
		expect(result).toEqual([{ figi: "figi-1" }])
	})

	test("skips fetch when marker still fresh", async () => {
		shouldStartFetchMock.mockResolvedValueOnce(false)
		getStoredBondCountMock.mockReturnValueOnce(1)
		loadStoredBondsMock.mockReturnValueOnce([{ figi: "cached" }])

		const result = await getOrBuildBondsData(true)

		expect(result).toEqual([{ figi: "cached" }])
		expect(markFetchStartedMock).not.toHaveBeenCalled()
		expect(syncAllBondDataMock).not.toHaveBeenCalled()
	})

	test("returns empty list when marker fresh and storage empty", async () => {
		shouldStartFetchMock.mockResolvedValueOnce(false)

		const result = await getOrBuildBondsData(true)

		expect(result).toEqual([])
		expect(markFetchStartedMock).not.toHaveBeenCalled()
		expect(syncAllBondDataMock).not.toHaveBeenCalled()
	})

	test("clears marker when sync fails", async () => {
		syncAllBondDataMock.mockRejectedValueOnce(new Error("boom"))

		await expect(getOrBuildBondsData()).rejects.toThrow("boom")

		expect(markFetchStartedMock).toHaveBeenCalledTimes(1)
		expect(clearFetchMarkerMock).toHaveBeenCalledTimes(1)
	})
})
