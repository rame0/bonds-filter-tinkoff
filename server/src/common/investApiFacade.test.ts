import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test"
import { InstrumentStatus } from "./interfaces/InvestApi"
import { setApiForTests } from "./api"

const bondsMock = mock(async () => ({ instruments: [] as any[] }))
const getLastPricesMock = mock(async () => ({ lastPrices: [] as any[] }))
const getBondCouponsMock = mock(async () => ({ events: [] as any[] }))

const facade = await import("./investApiFacade")

describe("investApiFacade", () => {
	beforeEach(() => {
		setApiForTests({
			instruments: {
				bonds: bondsMock as any,
				getBondCoupons: getBondCouponsMock as any,
			},
			marketdata: {
				getLastPrices: getLastPricesMock as any,
			},
		} as any)
		bondsMock.mockReset()
		getLastPricesMock.mockReset()
		getBondCouponsMock.mockReset()
	})

	afterEach(() => {
		setApiForTests(undefined)
		mock.restore()
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

			expect(getBondCouponsMock).toHaveBeenCalledWith({
				figi: "figi-2",
				from: new Date("2000-01-01T00:00:00.000Z"),
				to: new Date("2100-01-01T00:00:00.000Z"),
				instrumentId: "figi-2",
			})
			expect(result).toEqual([])
		})
})
