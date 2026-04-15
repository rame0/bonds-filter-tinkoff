import { describe, expect, mock, test } from "bun:test"
import { SecurityTradingStatus } from "./interfaces/InvestApi"

const listBondsByStatusMock = mock(async () => [])

mock.module("./investApiFacade", () => ({
	listBondsByStatus: listBondsByStatusMock,
}))

const { buildPrimaryPlacementsData } = await import("./buildPrimaryPlacementsData")

describe("buildPrimaryPlacementsData", () => {
	test("keeps bonds with placement date and no trading signals", async () => {
		listBondsByStatusMock.mockResolvedValue([
			{
				uid: "uid-1",
				figi: "figi-1",
				ticker: "NEW1",
				name: "New Bond",
				currency: "rub",
				placementDate: futureDate(5),
				placementPrice: { units: 1000, nano: 0, currency: "rub" },
				tradingStatus: SecurityTradingStatus.SECURITY_TRADING_STATUS_NOT_AVAILABLE_FOR_TRADING,
				buyAvailableFlag: false,
				sellAvailableFlag: false,
				apiTradeAvailableFlag: false,
			},
		])

		const result = await buildPrimaryPlacementsData()

		expect(result).toHaveLength(1)
		expect(result[0].ticker).toBe("NEW1")
		expect(result[0].placementPrice).toBe(1000)
		expect(result[0].hasStartedTrading).toBe(false)
	})

	test("drops bonds that already have trading signals", async () => {
		listBondsByStatusMock.mockResolvedValue([
			{
				uid: "uid-2",
				figi: "figi-2",
				ticker: "OLD1",
				name: "Old Bond",
				currency: "rub",
				placementDate: futureDate(-1),
				first1dayCandleDate: futureDate(-1),
				tradingStatus: SecurityTradingStatus.SECURITY_TRADING_STATUS_NORMAL_TRADING,
				buyAvailableFlag: true,
				sellAvailableFlag: true,
				apiTradeAvailableFlag: true,
			},
		])

		const result = await buildPrimaryPlacementsData()

		expect(result).toEqual([])
	})
})

function futureDate(offsetDays: number) {
	return new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000).toISOString()
}
