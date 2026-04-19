import { beforeEach, describe, expect, mock, test } from "bun:test"

const mkdirMock = mock(async () => undefined)
const rmMock = mock(async () => undefined)
const statMock = mock(async () => ({ mtimeMs: 0 }))
const utimesMock = mock(async () => undefined)
const writeFileMock = mock(async () => undefined)

mock.module("node:fs/promises", () => ({
	mkdir: mkdirMock,
	rm: rmMock,
	stat: statMock,
	utimes: utimesMock,
	writeFile: writeFileMock,
}))

const { clearFetchMarker, getFetchMarkerPath, markFetchStarted, shouldStartFetch } = await import("./fetchGate")

describe("fetchGate", () => {
	beforeEach(() => {
		mkdirMock.mockReset()
		rmMock.mockReset()
		statMock.mockReset()
		utimesMock.mockReset()
		writeFileMock.mockReset()
	})

	test("starts fetch when marker file is missing", async () => {
		statMock.mockRejectedValueOnce(Object.assign(new Error("missing"), { code: "ENOENT" }))

		expect(await shouldStartFetch()).toBe(true)
	})

	test("skips fetch when marker is fresh", async () => {
		statMock.mockResolvedValueOnce({ mtimeMs: Date.now() - 1_000 } as { mtimeMs: number })

		expect(await shouldStartFetch()).toBe(false)
	})

	test("starts fetch when marker is stale", async () => {
		statMock.mockResolvedValueOnce({ mtimeMs: Date.now() - 4 * 60 * 60 * 1000 - 1 } as { mtimeMs: number })

		expect(await shouldStartFetch()).toBe(true)
	})

	test("creates marker when missing", async () => {
		const now = new Date("2026-04-19T10:00:00.000Z")
		utimesMock.mockRejectedValueOnce(Object.assign(new Error("missing"), { code: "ENOENT" }))

		await markFetchStarted(now)

		expect(mkdirMock).toHaveBeenCalledWith(".cache", { recursive: true })
		expect(writeFileMock).toHaveBeenCalledWith(getFetchMarkerPath(), "", "utf8")
		expect(utimesMock).toHaveBeenCalledTimes(2)
	})

	test("removes marker on fetch failure", async () => {
		await clearFetchMarker()

		expect(rmMock).toHaveBeenCalledWith(getFetchMarkerPath(), { force: true })
	})
})
