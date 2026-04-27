import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test"
import moment from "moment"
import * as couponSummaryModule from "./getCouponSummary"
import * as investApiFacade from "./investApiFacade"
import * as moexDataModule from "./getMoexData"
import { LiquidityType } from "./interfaces/Moex"

const listBondsMock = mock(async () => [] as any[])
const getLastPricesMock = mock(async () => [] as any[])
const getMoexDataMock = mock(async () => ({}))
const getCouponSummaryMock = mock(async () => undefined as any)

const { buildBondsData } = await import("./buildBondsData")

	describe("buildBondsData", () => {
	beforeEach(() => {
		spyOn(investApiFacade, "listBonds").mockImplementation(listBondsMock as any)
		spyOn(investApiFacade, "getLastPrices").mockImplementation(getLastPricesMock as any)
		spyOn(moexDataModule, "getMoexData").mockImplementation(getMoexDataMock as any)
		spyOn(moexDataModule, "mapWithConcurrency").mockImplementation(
			async (items: unknown[], _concurrency: number, worker: (item: unknown, index: number) => Promise<void>) => {
				for (let i = 0; i < items.length; i++) {
					await worker(items[i], i)
				}
			},
		)
		spyOn(couponSummaryModule, "getCouponSummary").mockImplementation(getCouponSummaryMock as any)
		listBondsMock.mockReset()
		getLastPricesMock.mockReset()
		getMoexDataMock.mockReset()
		getCouponSummaryMock.mockReset()
	})

	afterEach(() => {
		mock.restore()
	})

	test("converts money-like fields and merges market plus MOEX data", async () => {
		listBondsMock.mockResolvedValue([
			{
				uid: "uid-1",
				figi: "figi-1",
				ticker: "BOND1",
				name: "Bond 1",
				currency: "rub",
				nominal: { units: 1000, nano: 500000000 },
				placementPrice: { units: 950, nano: 0 },
				aciValue: { units: 12, nano: 340000000 },
				buyBackDate: "2030-01-01T00:00:00.000Z",
				maturityDate: "2031-01-01T00:00:00.000Z",
			},
		])

		getLastPricesMock.mockResolvedValue([{ figi: "figi-1", price: { units: 101, nano: 230000000 } }])

		getMoexDataMock.mockResolvedValue({
			BOND1: {
				couponsYield: 88.888,
				BondYield: 14.567,
				BondDuration: 18.444,
				liquidity: LiquidityType.high,
			},
		})
		getCouponSummaryMock.mockResolvedValue(undefined)

		const result = await buildBondsData()

		expect(result).toHaveLength(1)
		expect(result[0]).toMatchObject({
			uid: "uid-1",
			figi: "figi-1",
			ticker: "BOND1",
			nominal: 1000.5,
			placementPrice: 950,
			aciValue: 12.34,
			price: 101.23,
			couponsYield: 88.89,
			bondYield: 14.57,
			duration: 18.44,
			liquidity: LiquidityType.high,
		})
	})

	test("falls back to buyback or maturity date when MOEX duration is missing", async () => {
		const buyBackDate = moment().add(65, "days").toISOString()
		const maturityDate = moment().add(130, "days").toISOString()

		listBondsMock.mockResolvedValue([
			{
				uid: "uid-2",
				figi: "figi-2",
				ticker: "BOND2",
				name: "Bond 2",
				currency: "rub",
				buyBackDate,
				maturityDate,
			},
			{
				uid: "uid-3",
				figi: "figi-3",
				ticker: "BOND3",
				name: "Bond 3",
				currency: "rub",
				maturityDate,
			},
		])

		getLastPricesMock.mockResolvedValue([])

		getMoexDataMock.mockResolvedValue({
			BOND2: {},
			BOND3: { BondDuration: 0 },
		})
		getCouponSummaryMock.mockResolvedValue(undefined)

		const result = await buildBondsData()
		const buyBackMonths = roundMonthsUntil(buyBackDate)
		const maturityMonths = roundMonthsUntil(maturityDate)

		expect(result).toHaveLength(2)
		expect(result[0].duration).toBeGreaterThanOrEqual(buyBackMonths - 0.05)
		expect(result[0].duration).toBeLessThanOrEqual(buyBackMonths + 0.05)
		expect(result[1].duration).toBeGreaterThanOrEqual(maturityMonths - 0.05)
		expect(result[1].duration).toBeLessThanOrEqual(maturityMonths + 0.05)
	})

	test("backfills coupon metrics when MOEX data is missing", async () => {
		listBondsMock.mockResolvedValue([
			{
				uid: "uid-4",
				figi: "figi-4",
				ticker: "BOND4",
				name: "Bond 4",
				currency: "usd",
				nominal: { units: 1000, nano: 0 },
				aciValue: { units: 10, nano: 0 },
			},
		])

		getLastPricesMock.mockResolvedValue([{ figi: "figi-4", price: { units: 95, nano: 0 } }])

		getMoexDataMock.mockResolvedValue({ BOND4: {} })
		getCouponSummaryMock.mockResolvedValue({
			annualCouponSum: 41.5,
			leftCouponCount: 2,
			leftToPay: 41.5,
			coupons: [
				{ couponNumber: 1, couponDate: futureDate(30), payout: 20 },
				{ couponNumber: 2, couponDate: futureDate(180), payout: 21.5 },
			],
		})

		const result = await buildBondsData()

		expect(getCouponSummaryMock).toHaveBeenCalledWith("figi-4", false, expect.anything())
		expect(result[0]).toMatchObject({
			couponsYield: 41.5,
			leftCouponCount: 2,
			leftToPay: 41.5,
			realPrice: 960,
			bondYield: 4.32,
		})
		expect(result[0].coupons).toHaveLength(2)
		expect(result[0].coupons?.[0].payout).toBe(20)
	})

	test("replaces zero MOEX coupon sum with T-Bank coupon data", async () => {
		listBondsMock.mockResolvedValue([
			{
				uid: "uid-5",
				figi: "figi-5",
				ticker: "BOND5",
				name: "Bond 5",
				currency: "rub",
				nominal: { units: 1000, nano: 0 },
				aciValue: { units: 5, nano: 0 },
			},
		])

		getLastPricesMock.mockResolvedValue([{ figi: "figi-5", price: { units: 98, nano: 0 } }])

		getMoexDataMock.mockResolvedValue({
			BOND5: {
				couponsYield: 0,
				BondYield: 12.34,
			},
		})
		getCouponSummaryMock.mockResolvedValue({
			annualCouponSum: 21.5,
			leftCouponCount: 2,
			leftToPay: 21.5,
			coupons: [
				{ couponNumber: 1, couponDate: futureDate(30), payout: 10 },
				{ couponNumber: 2, couponDate: futureDate(60), payout: 11.5 },
			],
		})

		const result = await buildBondsData()

		expect(result[0]).toMatchObject({
			couponsYield: 21.5,
			bondYield: 12.34,
			leftCouponCount: 2,
			leftToPay: 21.5,
		})
	})

	test("uses last known payout for floating coupons with zero future values", async () => {
		listBondsMock.mockResolvedValue([
			{
				uid: "uid-6",
				figi: "figi-6",
				ticker: "BOND6",
				name: "Bond 6",
				currency: "rub",
				nominal: { units: 1000, nano: 0 },
				aciValue: { units: 2, nano: 0 },
				floatingCouponFlag: true,
			},
		])

		getLastPricesMock.mockResolvedValue([{ figi: "figi-6", price: { units: 90, nano: 0 } }])

		getMoexDataMock.mockResolvedValue({
			BOND6: {
				couponsYield: 0,
				BondYield: 9.99,
			},
		})
		getCouponSummaryMock.mockResolvedValue({
			annualCouponSum: 37.5,
			leftCouponCount: 3,
			leftToPay: 37.5,
			coupons: [
				{ couponNumber: 2, couponDate: futureDate(90), payout: 12.5, isEstimated: true },
				{ couponNumber: 3, couponDate: futureDate(180), payout: 12.5, isEstimated: true },
				{ couponNumber: 4, couponDate: futureDate(270), payout: 12.5, isEstimated: true },
			],
		})

		const result = await buildBondsData()

		expect(result[0]).toMatchObject({
			couponsYield: 37.5,
			bondYield: 9.99,
			leftCouponCount: 3,
			leftToPay: 37.5,
		})
		expect(result[0].coupons?.every(coupon => coupon.payout === 12.5)).toBe(true)
	})
})

function roundMonthsUntil(date: string) {
	return Math.round((moment(date).diff(moment(), "days") / 30) * 100) / 100 || 0
}

function futureDate(offsetDays: number) {
	return moment().add(offsetDays, "days").toISOString()
}

function pastDate(offsetDays: number) {
	return moment().subtract(offsetDays, "days").toISOString()
}
