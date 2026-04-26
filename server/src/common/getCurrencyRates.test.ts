import { beforeEach, describe, expect, mock, test } from "bun:test"

const axiosGetMock = mock(async () => ({ data: "" }))
let cacheStore = new Map<string, unknown>()

mock.module("axios", () => ({
	default: {
		get: axiosGetMock,
	},
}))

mock.module("./cache", () => ({
	createCache: () => ({
		get: async (key: string) => cacheStore.get(key),
		getSync: (key: string) => cacheStore.get(key),
		set: async (key: string, value: unknown) => {
			cacheStore.set(key, value)
		},
	}),
}))

const { convertToRub, getCurrencyRate, parseCurrencyRatesXml, refreshCurrencyRates } = await import("./getCurrencyRates")

describe("getCurrencyRates", () => {
	beforeEach(() => {
		axiosGetMock.mockReset()
		cacheStore = new Map<string, unknown>()
	})

	test("parses CBR XML and normalizes rates to one currency unit", () => {
		const snapshot = parseCurrencyRatesXml(`
			<ValCurs Date="20.04.2026" name="Foreign Currency Market">
				<Valute ID="R01235">
					<CharCode>USD</CharCode>
					<Nominal>1</Nominal>
					<Value>82,5500</Value>
				</Valute>
				<Valute ID="R01820">
					<CharCode>JPY</CharCode>
					<Nominal>100</Nominal>
					<Value>55,1234</Value>
				</Valute>
			</ValCurs>
		`, new Date("2026-04-20T04:00:00.000Z"))

		expect(snapshot.rateDate).toBe("20.04.2026")
		expect(snapshot.rates.USD.rate).toBe(82.55)
		expect(snapshot.rates.JPY.rate).toBe(0.551234)
	})

	test("returns cached snapshot when refresh fails", async () => {
		cacheStore.set("currencyRates", {
			baseCurrency: "RUB",
			rateDate: "19.04.2026",
			updatedAt: "2026-04-19T04:00:00.000Z",
			rates: {
				USD: { charCode: "USD", nominal: 1, value: 80, rate: 80 },
			},
		})
		axiosGetMock.mockRejectedValueOnce(new Error("boom"))

		const snapshot = await refreshCurrencyRates()

		expect(snapshot.rateDate).toBe("19.04.2026")
		expect(snapshot.rates.USD.rate).toBe(80)
	})

	test("refreshes and stores new snapshot when request succeeds", async () => {
		axiosGetMock.mockResolvedValueOnce({
			data: `
				<ValCurs Date="20.04.2026">
					<Valute ID="R01235">
						<CharCode>USD</CharCode>
						<Nominal>1</Nominal>
						<Value>81,5000</Value>
					</Valute>
				</ValCurs>
			`,
		})

		const snapshot = await refreshCurrencyRates(new Date("2026-04-20T05:00:00.000Z"))

		expect(axiosGetMock).toHaveBeenCalledTimes(1)
		expect(snapshot.rates.USD.rate).toBe(81.5)
		expect(getCurrencyRate(snapshot, "RUB")).toBe(1)
		expect(convertToRub(10, "USD", snapshot)).toBe(815)
	})
})
