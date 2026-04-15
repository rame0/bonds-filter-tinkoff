import { beforeEach, describe, expect, mock, test } from "bun:test"
import moment from "moment"
import { LiquidityType } from "./interfaces/Moex"

const bondsMock = mock(async () => ({ instruments: [] as any[] }))
const getLastPricesMock = mock(async () => ({ lastPrices: [] as any[] }))
const getMoexDataMock = mock(async () => ({}))

mock.module("./api", () => ({
	api: {
		instruments: {
			bonds: bondsMock,
		},
		marketdata: {
			getLastPrices: getLastPricesMock,
		},
	},
}))

mock.module("./getMoexData", () => ({
	getMoexData: getMoexDataMock,
}))

const { buildBondsData } = await import("./buildBondsData")

describe("buildBondsData", () => {
	beforeEach(() => {
		bondsMock.mockReset()
		getLastPricesMock.mockReset()
		getMoexDataMock.mockReset()
	})

	test("converts money-like fields and merges market plus MOEX data", async () => {
		bondsMock.mockResolvedValue({
			instruments: [
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
			],
		})

		getLastPricesMock.mockResolvedValue({
			lastPrices: [{ figi: "figi-1", price: { units: 101, nano: 230000000 } }],
		})

		getMoexDataMock.mockResolvedValue({
			BOND1: {
				couponsYield: 88.888,
				BondYield: 14.567,
				BondDuration: 18.444,
				liquidity: LiquidityType.high,
			},
		})

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

		bondsMock.mockResolvedValue({
			instruments: [
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
			],
		})

		getLastPricesMock.mockResolvedValue({
			lastPrices: [],
		})

		getMoexDataMock.mockResolvedValue({
			BOND2: {},
			BOND3: { BondDuration: 0 },
		})

		const result = await buildBondsData()
		const buyBackMonths = roundMonthsUntil(buyBackDate)
		const maturityMonths = roundMonthsUntil(maturityDate)

		expect(result).toHaveLength(2)
		expect(result[0].duration).toBeGreaterThanOrEqual(buyBackMonths - 0.05)
		expect(result[0].duration).toBeLessThanOrEqual(buyBackMonths + 0.05)
		expect(result[1].duration).toBeGreaterThanOrEqual(maturityMonths - 0.05)
		expect(result[1].duration).toBeLessThanOrEqual(maturityMonths + 0.05)
	})
})

function roundMonthsUntil(date: string) {
	return Math.round((moment(date).diff(moment(), "days") / 30) * 100) / 100 || 0
}
