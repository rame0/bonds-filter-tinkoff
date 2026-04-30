import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test"
import * as currencyRatesModule from "../common/getCurrencyRates"
import * as bondsDataModule from "../common/getOrBuildBondsData"
import * as syncBondDataModule from "../common/syncBondData"

const getCachedBondsDataMock = mock(async () => null)
const syncAllBondDataMock = mock(async () => [])
const getCachedCurrencyRatesMock = mock(async () => null)
const refreshCurrencyRatesMock = mock(async () => ({ rates: {} }))

const { default: schedulerService } = await import("./scheduler.service")

describe("scheduler.service", () => {
	beforeEach(() => {
		spyOn(bondsDataModule, "getCachedBondsData").mockImplementation(getCachedBondsDataMock as any)
		spyOn(syncBondDataModule, "syncAllBondData").mockImplementation(syncAllBondDataMock as any)
		spyOn(currencyRatesModule, "getCachedCurrencyRates").mockImplementation(getCachedCurrencyRatesMock as any)
		spyOn(currencyRatesModule, "refreshCurrencyRates").mockImplementation(refreshCurrencyRatesMock as any)
		getCachedBondsDataMock.mockReset()
		syncAllBondDataMock.mockReset()
		getCachedCurrencyRatesMock.mockReset()
		refreshCurrencyRatesMock.mockReset()
		getCachedBondsDataMock.mockResolvedValue(null)
		syncAllBondDataMock.mockResolvedValue([])
		getCachedCurrencyRatesMock.mockResolvedValue(null)
		refreshCurrencyRatesMock.mockResolvedValue({ rates: {} })
	})

	afterEach(() => {
		mock.restore()
	})

	test("triggers initial jobs when caches are empty", async () => {
		const [bondsCron, ratesCron] = schedulerService.crons

		await bondsCron.runOnInit()
		await ratesCron.runOnInit()

		expect(getCachedBondsDataMock).toHaveBeenCalledTimes(1)
		expect(syncAllBondDataMock).toHaveBeenCalledTimes(1)
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

		expect(syncAllBondDataMock).not.toHaveBeenCalled()
		expect(refreshCurrencyRatesMock).not.toHaveBeenCalled()
	})
})
