import { describe, expect, test } from "bun:test"
import { getBondFilterOptions, listBondsData } from "./listBondsData"

const bonds = [
	{
		uid: "1",
		name: "Альфа 1",
		ticker: "ALFA1",
		figi: "figi-1",
		isin: "isin-1",
		currency: "rub",
		classCode: 1,
		couponQuantityPerYear: 12,
		countryOfRisk: "RU",
		bondYield: 101,
		duration: 24,
		price: 99,
		liquidity: 2,
		coupons: [{ couponDate: "2026-05-10T00:00:00.000Z" }],
		qty: 0,
	},
	{
		uid: "2",
		name: "Бета 2",
		ticker: "BETA2",
		figi: "figi-2",
		isin: "isin-2",
		currency: "usd",
		classCode: 2,
		couponQuantityPerYear: 4,
		countryOfRisk: "US",
		bondYield: 95,
		duration: 60,
		price: 102,
		liquidity: 1,
		coupons: [{ couponDate: "2026-07-20T00:00:00.000Z" }],
		qty: 0,
	},
	{
		uid: "3",
		name: "Гамма 3",
		ticker: "GAMMA3",
		figi: "figi-3",
		isin: "isin-3",
		currency: "rub",
		classCode: 1,
		couponQuantityPerYear: 2,
		countryOfRisk: "RU",
		bondYield: 110,
		duration: 12,
		price: 105,
		liquidity: 2,
		coupons: [{ couponDate: "2026-05-20T00:00:00.000Z" }, { couponDate: "2026-07-20T00:00:00.000Z" }],
		qty: 0,
	},
] as any[]

describe("listBondsData", () => {
	test("filters by search, range, array and coupon months", () => {
		const result = listBondsData(bonds, {
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

	test("sorts and paginates on the server", () => {
		const result = listBondsData(bonds, {
			page: 2,
			pageSize: 1,
			sortProp: "bondYield",
			sortOrder: "descending",
		})

		expect(result.total).toBe(3)
		expect(result.items.map(item => item.uid)).toEqual(["1"])
	})

	test("builds dynamic filter options from full dataset", () => {
		expect(getBondFilterOptions(bonds)).toEqual({
			classCode: [1, 2],
			currency: ["rub", "usd"],
			couponQuantityPerYear: [2, 4, 12],
			countryOfRisk: ["RU", "US"],
		})
	})
})
