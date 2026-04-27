import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test"
import * as currencyRatesModule from "../common/getCurrencyRates"
import * as bondsDataModule from "../common/getOrBuildBondsData"
import * as portfolioMetricsModule from "../common/getPortfolioMetrics"
import * as portfolioTableModule from "../common/getPortfolioTable"
import * as investApiFacade from "../common/investApiFacade"
import * as bondListModule from "../common/listBondsData"

const getBondCouponsMock = mock(async () => [] as any[])
const getOrBuildBondsDataMock = mock(async () => [])
const getBondsDataStatusMock = mock(async () => ({ isBuilding: false, hasCachedData: true }))
const ensureBondsDataBuildMock = mock(async () => undefined)
const getOrRefreshCurrencyRatesMock = mock(async () => ({ baseCurrency: "RUB", rateDate: "20.04.2026", updatedAt: "2026-04-20T04:00:00.000Z", rates: {} }))
const getPortfolioMetricsMock = mock(async () => ({ baseCurrency: "RUB" }))
const getPortfolioTableMock = mock(async () => ({ rows: [] }))
const listBondsDataMock = mock(() => ({ items: [], total: 0, page: 1, pageSize: 20 }))
const getBondFilterOptionsMock = mock(() => ({ classCode: [], currency: [], couponQuantityPerYear: [], countryOfRisk: [] }))

const { default: bondsService } = await import("./bonds.service")

describe("bonds.service coupons action", () => {
	beforeEach(() => {
		spyOn(investApiFacade, "getBondCoupons").mockImplementation(getBondCouponsMock as any)
		spyOn(bondsDataModule, "getOrBuildBondsData").mockImplementation(getOrBuildBondsDataMock as any)
		spyOn(bondsDataModule, "getBondsDataStatus").mockImplementation(getBondsDataStatusMock as any)
		spyOn(bondsDataModule, "ensureBondsDataBuild").mockImplementation(ensureBondsDataBuildMock as any)
		spyOn(currencyRatesModule, "getOrRefreshCurrencyRates").mockImplementation(getOrRefreshCurrencyRatesMock as any)
		spyOn(portfolioMetricsModule, "getPortfolioMetrics").mockImplementation(getPortfolioMetricsMock as any)
		spyOn(portfolioTableModule, "getPortfolioTable").mockImplementation(getPortfolioTableMock as any)
		spyOn(bondListModule, "listBondsData").mockImplementation(listBondsDataMock as any)
		spyOn(bondListModule, "getBondFilterOptions").mockImplementation(getBondFilterOptionsMock as any)
		getBondCouponsMock.mockReset()
		getOrBuildBondsDataMock.mockReset()
		getBondsDataStatusMock.mockReset()
		ensureBondsDataBuildMock.mockReset()
		getOrRefreshCurrencyRatesMock.mockReset()
		getPortfolioMetricsMock.mockReset()
		getOrBuildBondsDataMock.mockResolvedValue([])
		getBondsDataStatusMock.mockResolvedValue({ isBuilding: false, hasCachedData: true })
		ensureBondsDataBuildMock.mockResolvedValue(undefined)
		getOrRefreshCurrencyRatesMock.mockResolvedValue({ baseCurrency: "RUB", rateDate: "20.04.2026", updatedAt: "2026-04-20T04:00:00.000Z", rates: {} })
		getPortfolioMetricsMock.mockResolvedValue({ baseCurrency: "RUB" })
		getPortfolioTableMock.mockResolvedValue({ rows: [] })
		listBondsDataMock.mockReset()
		listBondsDataMock.mockReturnValue({ items: [], total: 0, page: 1, pageSize: 20 })
		getBondFilterOptionsMock.mockReset()
		getBondFilterOptionsMock.mockReturnValue({ classCode: [], currency: [], couponQuantityPerYear: [], countryOfRisk: [] })
	})

	afterEach(() => {
		mock.restore()
	})

	test("delegates instruments query to server-side listing helper", async () => {
		getOrBuildBondsDataMock.mockResolvedValueOnce([{ uid: "bond-1" }])
		listBondsDataMock.mockReturnValueOnce({ items: [{ uid: "bond-1" }], total: 1, page: 1, pageSize: 20 })

		const result = await bondsService.actions.instruments.handler({
			params: { page: 1, pageSize: 20, sortProp: "name", sortOrder: "ascending", filters: JSON.stringify({ search: "офз" }) },
			meta: {},
		})

		expect(getOrBuildBondsDataMock).toHaveBeenCalledTimes(1)
		expect(listBondsDataMock).toHaveBeenCalledWith(
			[{ uid: "bond-1" }],
			{ page: 1, pageSize: 20, sortProp: "name", sortOrder: "ascending", filters: { search: "офз" } },
		)
		expect(result).toEqual({ items: [{ uid: "bond-1" }], total: 1, page: 1, pageSize: 20 })
	})

	test("returns server-side filter options from cached bonds", async () => {
		getOrBuildBondsDataMock.mockResolvedValueOnce([{ uid: "bond-1" }])
		getBondFilterOptionsMock.mockReturnValueOnce({ classCode: [1], currency: ["rub"], couponQuantityPerYear: [2], countryOfRisk: ["RU"] })

		const result = await bondsService.actions.filterOptions.handler()

		expect(getOrBuildBondsDataMock).toHaveBeenCalledTimes(1)
		expect(getBondFilterOptionsMock).toHaveBeenCalledWith([{ uid: "bond-1" }])
		expect(result).toEqual({ classCode: [1], currency: ["rub"], couponQuantityPerYear: [2], countryOfRisk: ["RU"] })
	})

	test("sorts future coupons and maps payout from payOneBond", async () => {
		getBondCouponsMock.mockResolvedValue([
			{
				couponNumber: 3,
				couponDate: futureDate(30),
				payOneBond: { units: 7, nano: 250000000 },
			},
			{
				couponNumber: 1,
				couponDate: futureDate(-30),
				payOneBond: { units: 99, nano: 0 },
			},
			{
				couponNumber: 2,
				couponDate: futureDate(10),
				payOneBond: { units: 5, nano: 500000000 },
			},
		])

		const result = await bondsService.actions.coupons.handler({
			params: { id: "figi-1" },
			meta: {},
		})

		expect(getBondCouponsMock).toHaveBeenCalledWith("figi-1")
		expect(result).toHaveLength(2)
		expect(result.map((coupon: any) => coupon.couponNumber)).toEqual([2, 3])
		expect(result.map((coupon: any) => coupon.payout)).toEqual([5.5, 7.25])
	})

	test("respects explicit coupon limit", async () => {
		getBondCouponsMock.mockResolvedValue([
			{ couponNumber: 1, couponDate: futureDate(1), payOneBond: { units: 1, nano: 0 } },
			{ couponNumber: 2, couponDate: futureDate(2), payOneBond: { units: 2, nano: 0 } },
			{ couponNumber: 3, couponDate: futureDate(3), payOneBond: { units: 3, nano: 0 } },
		])

		const result = await bondsService.actions.coupons.handler({
			params: { id: "figi-2", limit: 2 },
			meta: {},
		})

		expect(result).toHaveLength(2)
		expect(result.map((coupon: any) => coupon.couponNumber)).toEqual([1, 2])
	})

	test("delegates portfolio metrics calculation to backend helper", async () => {
		getOrBuildBondsDataMock.mockResolvedValueOnce([{ uid: "bond-1" }])
		getBondsDataStatusMock.mockResolvedValueOnce({ isBuilding: false, hasCachedData: true, lastBuildCompletedAt: "2026-04-20T03:00:00.000Z" })

		const result = await bondsService.actions.portfolioMetrics.handler({
			params: { positions: [{ uid: "bond-1", qty: 2 }] },
			meta: {},
		})

		expect(getOrBuildBondsDataMock).toHaveBeenCalledTimes(1)
		expect(getBondsDataStatusMock).toHaveBeenCalledTimes(1)
		expect(getOrRefreshCurrencyRatesMock).toHaveBeenCalledTimes(1)
		expect(getPortfolioMetricsMock).toHaveBeenCalledWith(
			[{ uid: "bond-1", qty: 2 }],
			[{ uid: "bond-1" }],
			{ baseCurrency: "RUB", rateDate: "20.04.2026", updatedAt: "2026-04-20T04:00:00.000Z", rates: {} },
			{ isBuilding: false, hasCachedData: true, lastBuildCompletedAt: "2026-04-20T03:00:00.000Z" },
			expect.any(Object),
		)
		expect(result).toEqual({ baseCurrency: "RUB" })
	})

	test("delegates portfolio table calculation to backend helper", async () => {
		getOrBuildBondsDataMock.mockResolvedValueOnce([{ uid: "bond-1" }])
		getPortfolioTableMock.mockResolvedValueOnce({ rows: [{ uid: "bond-1", qty: 2 }] })

		const result = await bondsService.actions.portfolioTable.handler({
			params: { positions: [{ uid: "bond-1", qty: 2 }] },
			meta: {},
		})

		expect(getOrBuildBondsDataMock).toHaveBeenCalledTimes(1)
		expect(getPortfolioTableMock).toHaveBeenCalledWith(
			[{ uid: "bond-1", qty: 2 }],
			[{ uid: "bond-1" }],
		)
		expect(result).toEqual({ rows: [{ uid: "bond-1", qty: 2 }] })
	})
})

function futureDate(offsetDays: number) {
	return new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000).toISOString()
}
