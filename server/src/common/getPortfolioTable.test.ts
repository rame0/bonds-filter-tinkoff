import { describe, expect, mock, test } from "bun:test"
import moment from "moment"

const getCouponSummaryMock = mock(async () => undefined)

mock.module("./getCouponSummary", () => ({
	getCouponSummary: getCouponSummaryMock,
}))

const { getPortfolioTable } = await import("./getPortfolioTable")

describe("getPortfolioTable", () => {
		test("builds table rows from cached bond data", async () => {
			const result = await getPortfolioTable(
			[
				{ uid: "bond-1", qty: 3 },
				{ uid: "bond-2", qty: 0 },
			],
			[
				{
					uid: "bond-1",
					figi: "figi-1",
					name: "ОФЗ 26238",
					ticker: "SU26238RMFS4",
					currency: "rub",
					buyBackDate: "2028-06-15T00:00:00.000Z",
					maturityDate: "2029-06-15T00:00:00.000Z",
					price: 97.5,
					nominal: 1000,
					aciValue: 12.34,
					bondYield: 15.12,
					leftCouponCount: 3,
					coupons: [
						{ couponDate: "2026-01-15T00:00:00.000Z", payout: 50 },
						{ couponDate: "2026-04-15T00:00:00.000Z", payout: 50 },
						{ couponDate: "2027-01-15T00:00:00.000Z", payout: 40 },
					],
					sector: "government",
					riskLevel: 1,
					liquidity: 2,
					floatingCouponFlag: false,
					amortizationFlag: true,
				} as any,
				],
				moment("2025-12-01T00:00:00.000Z"),
			)

		expect(result.rows).toEqual([
			{
				uid: "bond-1",
				name: "ОФЗ 26238",
				ticker: "SU26238RMFS4",
				qty: 3,
				currency: "RUB",
				displayDate: "2028-06-15T00:00:00.000Z",
				pricePct: 97.5,
				nominal: 1000,
				aciValue: 12.34,
				fullPrice: 987.34,
				positionCost: 2962.02,
				bondYield: 15.12,
				couponCountLeft: 3,
				couponTooltip: {
					groups: [
						{ count: 2, amount: 50, currency: "RUB" },
						{ count: 1, amount: 40, currency: "RUB" },
					],
					isEstimated: false,
					isFloating: false,
					isAmortizing: true,
				},
				couponMonths: [true, false, false, true, false, false, false, false, false, false, false, false],
				sector: "government",
				riskLevel: 1,
				liquidity: 2,
			},
		])
	})

	test("falls back to coupon summary lookup when cached coupons absent", async () => {
		getCouponSummaryMock.mockResolvedValueOnce({
			leftCouponCount: 2,
			leftToPay: 25,
			coupons: [
				{ couponDate: "2026-02-10T00:00:00.000Z", payout: 12.5, isEstimated: true },
				{ couponDate: "2026-08-10T00:00:00.000Z", payout: 12.5, isEstimated: true },
			],
		})

			const result = await getPortfolioTable(
				[{ uid: "bond-2", qty: 2 }],
			[
				{
					uid: "bond-2",
					figi: "figi-2",
					name: "Флоатер",
					ticker: "FLOAT",
					currency: "usd",
					maturityDate: "2027-12-01T00:00:00.000Z",
					price: 100,
					nominal: 100,
					aciValue: 1,
					bondYield: 8.2,
					sector: "it",
					riskLevel: 2,
					floatingCouponFlag: true,
				} as any,
				],
				moment("2026-01-01T00:00:00.000Z"),
			)

		expect(getCouponSummaryMock).toHaveBeenCalledWith("figi-2", true, expect.anything())
		expect(result.rows[0]?.couponTooltip).toEqual({
			groups: [{ count: 2, amount: 12.5, currency: "USD" }],
			isEstimated: true,
			isFloating: true,
			isAmortizing: false,
		})
		expect(result.rows[0]?.couponMonths).toEqual([false, true, false, false, false, false, false, true, false, false, false, false])
	})

	test("limits coupon months to the next year", async () => {
		const result = await getPortfolioTable(
			[{ uid: "bond-3", qty: 1 }],
			[
				{
					uid: "bond-3",
					figi: "figi-3",
					name: "Регион 34009",
					ticker: "RU000A109RR3",
					currency: "rub",
					maturityDate: "2029-10-04T00:00:00.000Z",
					price: 100,
					nominal: 1000,
					aciValue: 0,
					bondYield: 12,
					leftCouponCount: 8,
					coupons: [
						{ couponDate: "2026-05-09T00:00:00.000Z", payout: 56.1 },
						{ couponDate: "2026-08-08T00:00:00.000Z", payout: 56.1 },
						{ couponDate: "2026-11-07T00:00:00.000Z", payout: 56.1 },
						{ couponDate: "2027-02-06T00:00:00.000Z", payout: 56.1 },
						{ couponDate: "2029-04-15T00:00:00.000Z", payout: 21.88 },
						{ couponDate: "2029-07-05T00:00:00.000Z", payout: 9.99 },
						{ couponDate: "2029-10-04T00:00:00.000Z", payout: 11.22 },
					],
					sector: "municipal",
					riskLevel: 1,
					floatingCouponFlag: false,
				} as any,
			],
			moment("2026-04-21T00:00:00.000Z"),
		)

		expect(result.rows[0]?.couponMonths).toEqual([false, true, false, false, true, false, false, true, false, false, true, false])
	})
})
