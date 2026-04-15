import { beforeEach, describe, expect, mock, test } from "bun:test"

const getOrBuildPrimaryPlacementsDataMock = mock(async () => [])
const getPrimaryPlacementsDataStatusMock = mock(async () => ({ isBuilding: false, hasCachedData: true }))
const ensurePrimaryPlacementsDataBuildMock = mock(async () => undefined)

mock.module("../common/getOrBuildPrimaryPlacementsData", () => ({
	getOrBuildPrimaryPlacementsData: getOrBuildPrimaryPlacementsDataMock,
	getPrimaryPlacementsDataStatus: getPrimaryPlacementsDataStatusMock,
	ensurePrimaryPlacementsDataBuild: ensurePrimaryPlacementsDataBuildMock,
}))

const { default: primaryService } = await import("./primary.service")

describe("primary.service", () => {
	beforeEach(() => {
		getOrBuildPrimaryPlacementsDataMock.mockReset()
		getPrimaryPlacementsDataStatusMock.mockReset()
		ensurePrimaryPlacementsDataBuildMock.mockReset()
	})

	test("returns primary placements from cache builder", async () => {
		getOrBuildPrimaryPlacementsDataMock.mockResolvedValue([
			{ uid: "uid-1", ticker: "NEW1", isPrimaryCandidate: true },
		])

		const result = await primaryService.actions.instruments.handler({ meta: {} })

		expect(result).toHaveLength(1)
		expect(result[0].ticker).toBe("NEW1")
	})

	test("warms status cache before returning state", async () => {
		getPrimaryPlacementsDataStatusMock.mockResolvedValue({ isBuilding: true, hasCachedData: false })

		const result = await primaryService.actions.status.handler()

		expect(ensurePrimaryPlacementsDataBuildMock).toHaveBeenCalled()
		expect(result).toEqual({ isBuilding: true, hasCachedData: false })
	})
})
