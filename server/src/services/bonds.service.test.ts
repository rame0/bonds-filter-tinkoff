import { beforeEach, describe, expect, mock, test } from "bun:test"

const getBondCouponsMock = mock(async () => ({ events: [] as any[] }))
const getOrBuildBondsDataMock = mock(async () => [])
const getBondsDataStatusMock = mock(async () => ({ isBuilding: false, hasCachedData: true }))
const ensureBondsDataBuildMock = mock(async () => undefined)
const getOrRefreshCurrencyRatesMock = mock(async () => ({ baseCurrency: "RUB", rateDate: "20.04.2026", updatedAt: "2026-04-20T04:00:00.000Z", rates: {} }))
const getPortfolioMetricsMock = mock(async () => ({ baseCurrency: "RUB" }))

mock.module("../common/api", () => ({
	api: {
		instruments: {
			getBondCoupons: getBondCouponsMock,
		},
	},
}))

mock.module("../common/getOrBuildBondsData", () => ({
	getOrBuildBondsData: getOrBuildBondsDataMock,
	getBondsDataStatus: getBondsDataStatusMock,
	ensureBondsDataBuild: ensureBondsDataBuildMock,
}))

mock.module("../common/getCurrencyRates", () => ({
	getOrRefreshCurrencyRates: getOrRefreshCurrencyRatesMock,
}))

mock.module("../common/getPortfolioMetrics", () => ({
	getPortfolioMetrics: getPortfolioMetricsMock,
}))

const { default: bondsService } = await import("./bonds.service")

describe("bonds.service coupons action", () => {
	beforeEach(() => {
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
	})

	test("sorts future coupons and maps payout from payOneBond", async () => {
		getBondCouponsMock.mockResolvedValue({
			events: [
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
			],
		})

		const result = await bondsService.actions.coupons.handler({
			params: { id: "figi-1" },
			meta: {},
		})

		expect(getBondCouponsMock).toHaveBeenCalledWith({
			figi: "figi-1",
			from: new Date("2000-01-01T00:00:00.000Z"),
			to: new Date("2100-01-01T00:00:00.000Z"),
			instrumentId: "figi-1",
		})
		expect(result).toHaveLength(2)
		expect(result.map((coupon: any) => coupon.couponNumber)).toEqual([2, 3])
		expect(result.map((coupon: any) => coupon.payout)).toEqual([5.5, 7.25])
	})

	test("respects explicit coupon limit", async () => {
		getBondCouponsMock.mockResolvedValue({
			events: [
				{ couponNumber: 1, couponDate: futureDate(1), payOneBond: { units: 1, nano: 0 } },
				{ couponNumber: 2, couponDate: futureDate(2), payOneBond: { units: 2, nano: 0 } },
				{ couponNumber: 3, couponDate: futureDate(3), payOneBond: { units: 3, nano: 0 } },
			],
		})

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
})

function futureDate(offsetDays: number) {
	return new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000).toISOString()
}
