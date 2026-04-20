import { beforeEach, describe, expect, mock, test } from "bun:test"

const getCachedBondsDataMock = mock(async () => null)
const getOrBuildBondsDataMock = mock(async () => [])
const getCachedCurrencyRatesMock = mock(async () => null)
const refreshCurrencyRatesMock = mock(async () => ({ rates: {} }))

mock.module("../common/getOrBuildBondsData", () => ({
	getCachedBondsData: getCachedBondsDataMock,
	getOrBuildBondsData: getOrBuildBondsDataMock,
}))

mock.module("../common/getCurrencyRates", () => ({
	getCachedCurrencyRates: getCachedCurrencyRatesMock,
	refreshCurrencyRates: refreshCurrencyRatesMock,
}))

const { default: schedulerService } = await import("./scheduler.service")

describe("scheduler.service", () => {
	beforeEach(() => {
		getCachedBondsDataMock.mockReset()
		getOrBuildBondsDataMock.mockReset()
		getCachedCurrencyRatesMock.mockReset()
		refreshCurrencyRatesMock.mockReset()
		getCachedBondsDataMock.mockResolvedValue(null)
		getOrBuildBondsDataMock.mockResolvedValue([])
		getCachedCurrencyRatesMock.mockResolvedValue(null)
		refreshCurrencyRatesMock.mockResolvedValue({ rates: {} })
	})

	test("triggers initial jobs when caches are empty", async () => {
		const [bondsCron, ratesCron] = schedulerService.crons

		await bondsCron.runOnInit()
		await ratesCron.runOnInit()

		expect(getCachedBondsDataMock).toHaveBeenCalledTimes(1)
		expect(getOrBuildBondsDataMock).toHaveBeenCalledWith(true)
		expect(getCachedCurrencyRatesMock).toHaveBeenCalledTimes(1)
		expect(refreshCurrencyRatesMock).toHaveBeenCalledTimes(1)
		expect(ratesCron.timeZone).toBe("Europe/Moscow")
		expect(ratesCron.cronTime).toBe("0 7,12,17 * * *")
	})

	test("skips initial refresh when caches already exist", async () => {
		const [bondsCron, ratesCron] = schedulerService.crons
		getCachedBondsDataMock.mockResolvedValueOnce([{ figi: "cached" }])
		getCachedCurrencyRatesMock.mockResolvedValueOnce({ rates: { USD: { rate: 80 } } })

		await bondsCron.runOnInit()
		await ratesCron.runOnInit()

		expect(getOrBuildBondsDataMock).not.toHaveBeenCalled()
		expect(refreshCurrencyRatesMock).not.toHaveBeenCalled()
	})
})
