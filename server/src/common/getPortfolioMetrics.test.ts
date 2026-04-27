import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test"
import moment from "moment"
import * as couponSummaryModule from "./getCouponSummary"

const getCouponSummaryMock = mock(async () => undefined)

const { getPortfolioMetrics } = await import("./getPortfolioMetrics")

describe("getPortfolioMetrics", () => {
	beforeEach(() => {
		spyOn(couponSummaryModule, "getCouponSummary").mockImplementation(getCouponSummaryMock as any)
		getCouponSummaryMock.mockReset()
	})

	afterEach(() => {
		mock.restore()
	})

	test("calculates totals, coupon schedule and sector allocation in rubles", async () => {
		const result = await getPortfolioMetrics(
			[
				{ uid: "bond-rub", qty: 2 },
				{ uid: "bond-usd", qty: 1 },
			],
			[
				{
					uid: "bond-rub",
					figi: "figi-rub",
					currency: "rub",
					sector: "energy",
					nominal: 1000,
					price: 90,
					aciValue: 10,
					riskLevel: 1,
					leftToPay: 60,
					leftCouponCount: 3,
					coupons: [
						{ couponDate: "2026-05-15T00:00:00.000Z", payout: 20 },
						{ couponDate: "2026-06-15T00:00:00.000Z", payout: 20 },
						{ couponDate: "2027-05-15T00:00:00.000Z", payout: 20 },
					],
				} as any,
				{
					uid: "bond-usd",
					figi: "figi-usd",
					currency: "usd",
					sector: "it",
					nominal: 100,
					price: 95,
					aciValue: 5,
					riskLevel: 3,
					leftToPay: 15,
					leftCouponCount: 2,
					coupons: [
						{ couponDate: "2026-05-20T00:00:00.000Z", payout: 10 },
						{ couponDate: "2026-11-20T00:00:00.000Z", payout: 5 },
					],
				} as any,
			],
			{
				baseCurrency: "RUB",
				rateDate: "20.04.2026",
				updatedAt: "2026-04-20T04:00:00.000Z",
				rates: {
					USD: { charCode: "USD", nominal: 1, value: 80, rate: 80 },
				},
			},
			{
				isBuilding: false,
				hasCachedData: true,
				lastBuildCompletedAt: "2026-04-20T03:00:00.000Z",
			},
			moment("2026-04-20T00:00:00.000Z"),
		)

		expect(result.totals).toEqual({
			totalBonds: 3,
			totalCoupons: 8,
			purchaseCostRub: 9820,
			couponProfitRub: 1320,
			maturityValueRub: 11320,
			maturityValuePct: 15.27,
		})
		expect(result.couponSchedule[0]).toEqual({ month: "2026-05", label: "май 2026 г.", amountRub: 840 })
		expect(result.couponSchedule[1]).toEqual({ month: "2026-06", label: "июнь 2026 г.", amountRub: 40 })
		expect(result.couponSchedule[6]).toEqual({ month: "2026-11", label: "нояб. 2026 г.", amountRub: 400 })
		expect(result.couponSchedule[11]).toEqual({ month: "2027-04", label: "апр. 2027 г.", amountRub: 0 })
		expect(result.sectorAllocation).toEqual([
			{ sector: "it", amountRub: 7600, sharePct: 80.85 },
			{ sector: "energy", amountRub: 1800, sharePct: 19.15 },
		])
		expect(result.riskProfile).toEqual({
			summary: "Высокий",
			items: [
				{ riskLevel: 3, label: "Высокий", amountRub: 7600, sharePct: 80.85 },
				{ riskLevel: 1, label: "Низкий", amountRub: 1800, sharePct: 19.15 },
			],
		})
		expect(result.actuality).toEqual({
			bondsUpdatedAt: "2026-04-20T03:00:00.000Z",
			ratesUpdatedAt: "2026-04-20T04:00:00.000Z",
			ratesDate: "20.04.2026",
			generatedAt: "2026-04-20T00:00:00.000Z",
		})
	})

	test("falls back to coupon summary lookup when cached bond data is incomplete", async () => {
		getCouponSummaryMock.mockResolvedValueOnce({
			leftToPay: 30,
			leftCouponCount: 2,
			coupons: [{ couponDate: "2026-05-01T00:00:00.000Z", payout: 15 }],
		})

		const result = await getPortfolioMetrics(
			[{ uid: "bond-1", qty: 1 }],
			[{ uid: "bond-1", figi: "figi-1", currency: "rub", sector: "other", riskLevel: 2, nominal: 1000, price: 100, aciValue: 0 } as any],
			{ baseCurrency: "RUB", rateDate: "20.04.2026", updatedAt: "2026-04-20T04:00:00.000Z", rates: {} },
			{ isBuilding: false, hasCachedData: true },
			moment("2026-04-20T00:00:00.000Z"),
		)

		expect(getCouponSummaryMock).toHaveBeenCalledWith("figi-1", false, expect.anything())
		expect(result.totals.totalCoupons).toBe(2)
		expect(result.totals.couponProfitRub).toBe(30)
		expect(result.riskProfile).toEqual({
			summary: "Средний",
			items: [{ riskLevel: 2, label: "Средний", amountRub: 1000, sharePct: 100 }],
		})
	})

	test("keeps current month in coupon window on first day of month", async () => {
		const result = await getPortfolioMetrics(
			[{ uid: "bond-1", qty: 1 }],
			[
				{
					uid: "bond-1",
					figi: "figi-1",
					currency: "rub",
					sector: "other",
					riskLevel: 1,
					nominal: 1000,
					price: 100,
					aciValue: 0,
					leftToPay: 20,
					leftCouponCount: 1,
					coupons: [{ couponDate: "2026-04-10T00:00:00.000Z", payout: 20 }],
				} as any,
			],
			{ baseCurrency: "RUB", rateDate: "01.04.2026", updatedAt: "2026-04-01T04:00:00.000Z", rates: {} },
			{ isBuilding: false, hasCachedData: true },
			moment("2026-04-01T00:00:00.000Z"),
		)

		expect(result.couponSchedule[0]).toEqual({ month: "2026-04", label: "апр. 2026 г.", amountRub: 20 })
		expect(result.couponSchedule[1]).toEqual({ month: "2026-05", label: "май 2026 г.", amountRub: 0 })
	})
})
