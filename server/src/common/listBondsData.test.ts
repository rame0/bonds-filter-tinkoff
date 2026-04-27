import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import {
	replaceBondCouponEvents,
	upsertBondDerivedMetrics,
	upsertBondInstrument,
	upsertBondLiquiditySnapshot,
	upsertBondMarketSnapshot,
} from "./bondDataStorage"
import { getBondFilterOptions, listBondsData } from "./listBondsData"
import { clearBondDataTables } from "./sqlite"

describe("listBondsData", () => {
	beforeEach(() => {
		clearBondDataTables()
		seedBond("1", {
			name: "Альфа 1",
			ticker: "ALFA1",
			figi: "figi-1",
			isin: "isin-1",
			currency: "rub",
			classCode: "1",
			couponQuantityPerYear: 12,
			countryOfRisk: "RU",
			bondYield: 101,
			duration: 24,
			price: 99,
			liquidity: 2,
			couponDates: ["2026-05-10T00:00:00.000Z"],
		})
		seedBond("2", {
			name: "Бета 2",
			ticker: "BETA2",
			figi: "figi-2",
			isin: "isin-2",
			currency: "usd",
			classCode: "2",
			couponQuantityPerYear: 4,
			countryOfRisk: "US",
			bondYield: 95,
			duration: 60,
			price: 102,
			liquidity: 1,
			couponDates: ["2026-07-20T00:00:00.000Z"],
		})
		seedBond("3", {
			name: "Гамма 3",
			ticker: "GAMMA3",
			figi: "figi-3",
			isin: "isin-3",
			currency: "rub",
			classCode: "1",
			couponQuantityPerYear: 2,
			countryOfRisk: "RU",
			bondYield: 110,
			duration: 12,
			price: 105,
			liquidity: 2,
			couponDates: ["2026-05-20T00:00:00.000Z", "2026-07-20T00:00:00.000Z"],
		})
	})

	afterEach(() => {
		clearBondDataTables()
	})

	test("filters by search, range, array and coupon months", () => {
		const result = listBondsData({
			filters: {
				search: "гамма",
				currency: ["rub"],
				bondYield: { from: 100, to: 120 },
				couponMonths: [4, 6],
				couponMonthsMatchMode: "all",
			},
		})

		expect(result.total).toBe(1)
		expect(result.items.map(item => item.uid)).toEqual(["3"])
	})

	test("sorts and paginates on server", () => {
		const result = listBondsData({
			page: 2,
			pageSize: 1,
			sortProp: "bondYield",
			sortOrder: "descending",
		})

		expect(result.total).toBe(3)
		expect(result.items.map(item => item.uid)).toEqual(["1"])
	})

	test("builds dynamic filter options from stored dataset", () => {
		expect(getBondFilterOptions()).toEqual({
			classCode: [1, 2],
			currency: ["rub", "usd"],
			couponQuantityPerYear: [2, 4, 12],
			countryOfRisk: ["RU", "US"],
		})
	})
})

function seedBond(uid: string, input: {
	name: string
	ticker: string
	figi: string
	isin: string
	currency: string
	classCode: string
	couponQuantityPerYear: number
	countryOfRisk: string
	bondYield: number
	duration: number
	price: number
	liquidity: number
	couponDates: string[]
}) {
	const now = "2026-04-20T00:00:00.000Z"
	upsertBondInstrument({
		uid,
		figi: input.figi,
		ticker: input.ticker,
		isin: input.isin,
		name: input.name,
		currency: input.currency,
		countryOfRisk: input.countryOfRisk,
		couponQuantityPerYear: input.couponQuantityPerYear,
		floatingCouponFlag: false,
		amortizationFlag: false,
		perpetualFlag: false,
		subordinatedFlag: false,
		buyAvailableFlag: true,
		sellAvailableFlag: true,
		apiTradeAvailableFlag: true,
		forIisFlag: true,
		forQualInvestorFlag: false,
		otcFlag: false,
		weekendFlag: false,
		classCode: input.classCode,
		sourceUpdatedAt: now,
		updatedAt: now,
	})
	upsertBondMarketSnapshot({
		uid,
		pricePercent: input.price,
		priceSource: "tinkoff",
		bondYieldPercent: input.bondYield,
		bondYieldSource: "moex",
		durationMonths: input.duration,
		durationSource: "moex",
		marketCurrency: input.currency,
		sourceUpdatedAt: now,
		updatedAt: now,
	})
	upsertBondLiquiditySnapshot({
		uid,
		liquidity: input.liquidity,
		liquiditySource: "moex",
		updatedAt: now,
	})
	replaceBondCouponEvents(uid, input.couponDates.map((couponDate, index) => ({
		eventKey: `${uid}:${index}`,
		uid,
		couponNumber: index + 1,
		couponDate,
		eventDate: couponDate,
		eventType: "coupon",
		couponValueNative: 10,
		couponCurrency: input.currency,
		couponValueRub: 10,
		isFloating: false,
		isAmortizing: false,
		isPerpetual: false,
		isKnown: true,
		isEstimated: false,
		source: "moex",
		sourcePriority: 1,
		updatedAt: now,
	} as any)))
	upsertBondDerivedMetrics({
		uid,
		couponsYieldRub12m: 100,
		couponsYieldSource: "moex",
		bondYieldPercentFinal: input.bondYield,
		bondYieldFinalSource: "moex",
		durationMonthsFinal: input.duration,
		durationFinalSource: "moex",
		leftCouponCount: input.couponDates.length,
		dirtyReason: undefined,
		computedAt: now,
	})
}
