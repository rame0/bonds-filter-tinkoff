import { beforeEach, describe, expect, mock, test } from "bun:test"
import { InstrumentStatus } from "./interfaces/InvestApi"

const bondsMock = mock(async () => ({ instruments: [] as any[] }))
const getLastPricesMock = mock(async () => ({ lastPrices: [] as any[] }))
const getBondCouponsMock = mock(async () => ({ events: [] as any[] }))

mock.module("./api", () => ({
	api: {
		instruments: {
			bonds: bondsMock,
			getBondCoupons: getBondCouponsMock,
		},
		marketdata: {
			getLastPrices: getLastPricesMock,
		},
	},
}))

const facade = await import("./investApiFacade")

describe("investApiFacade", () => {
	beforeEach(() => {
		bondsMock.mockReset()
		getLastPricesMock.mockReset()
		getBondCouponsMock.mockReset()
	})

	test("listBonds requests base instruments and unwraps response", async () => {
		bondsMock.mockResolvedValue({
			instruments: [{ uid: "uid-1", figi: "figi-1", ticker: "B1", name: "Bond 1", currency: "rub" }],
		})

		const result = await facade.listBonds()

		expect(bondsMock).toHaveBeenCalledWith({
			instrumentStatus: InstrumentStatus.INSTRUMENT_STATUS_BASE,
		})
		expect(result).toHaveLength(1)
		expect(result[0].ticker).toBe("B1")
	})

	test("getLastPrices unwraps market data response", async () => {
		getLastPricesMock.mockResolvedValue({
			lastPrices: [{ figi: "figi-1", price: { units: 101, nano: 0 } }],
		})

		const result = await facade.getLastPrices(["uid-1"])

		expect(getLastPricesMock).toHaveBeenCalledWith({
			figi: [],
			instrumentId: ["uid-1"],
		})
		expect(result).toEqual([{ figi: "figi-1", price: { units: 101, nano: 0 } }])
	})

		test("getBondCoupons returns empty array when events are missing", async () => {
			getBondCouponsMock.mockResolvedValue({})

			const result = await facade.getBondCoupons("figi-2")

			expect(getBondCouponsMock).toHaveBeenCalledWith({ figi: "figi-2", instrumentId: "figi-2" })
			expect(result).toEqual([])
		})
})
