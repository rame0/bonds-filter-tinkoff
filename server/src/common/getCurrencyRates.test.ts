import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test"
import axios from "axios"
import { clearCacheEntries } from "./cache"

const axiosGetMock = mock(async () => ({ data: "" }))

const { convertToRub, getCurrencyRate, parseCurrencyRatesXml, refreshCurrencyRates } = await import("./getCurrencyRates")

describe("getCurrencyRates", () => {
	beforeEach(() => {
		spyOn(axios, "get").mockImplementation(axiosGetMock as any)
		axiosGetMock.mockReset()
		clearCacheEntries()
	})

	afterEach(() => {
		mock.restore()
		clearCacheEntries()
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
		await refreshCurrencyRates(new Date("2026-04-19T04:00:00.000Z")).catch(() => undefined)
		const cachedSnapshot = {
			baseCurrency: "RUB",
			rateDate: "19.04.2026",
			updatedAt: "2026-04-19T04:00:00.000Z",
			rates: {
				USD: { charCode: "USD", nominal: 1, value: 80, rate: 80 },
			},
		}
		axiosGetMock.mockResolvedValueOnce({
			data: "<ValCurs Date=\"19.04.2026\"><Valute><CharCode>USD</CharCode><Nominal>1</Nominal><Value>80,0000</Value></Valute></ValCurs>",
		})
		await refreshCurrencyRates(new Date("2026-04-19T04:00:00.000Z"))
		axiosGetMock.mockRejectedValueOnce(new Error("boom"))

		const snapshot = await refreshCurrencyRates()

		expect(cachedSnapshot.rateDate).toBe("19.04.2026")
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
