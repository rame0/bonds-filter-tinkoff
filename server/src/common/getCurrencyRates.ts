import axios from "axios"
import { createCache } from "./cache"
import { getErrorMessage } from "./utils/error"
import { roundTo } from "./utils/round"

const cache = createCache()
const CBR_DAILY_URL = "https://www.cbr.ru/scripts/XML_daily.asp"
const CACHE_KEY = "currencyRates"

export interface CurrencyRateEntry {
	charCode: string
	nominal: number
	value: number
	rate: number
}

export interface CurrencyRatesSnapshot {
	baseCurrency: "RUB"
	rateDate: string
	updatedAt: string
	rates: Record<string, CurrencyRateEntry>
}

export async function getCachedCurrencyRates() {
	const cached = await cache.get(CACHE_KEY)
	return isCurrencyRatesSnapshot(cached) ? cached : null
}

export async function getOrRefreshCurrencyRates() {
	const cached = await getCachedCurrencyRates()
	if (cached) {
		return cached
	}

	return refreshCurrencyRates()
}

export async function refreshCurrencyRates(now = new Date()) {
	const cached = await getCachedCurrencyRates()

	try {
		const response = await axios.get(CBR_DAILY_URL, {
			headers: { Accept: "application/xml,text/xml;q=0.9,*/*;q=0.8" },
			responseType: "text",
			timeout: 20_000,
		})
		const snapshot = parseCurrencyRatesXml(String(response.data), now)
		await cache.set(CACHE_KEY, snapshot)
		return snapshot
	} catch (error) {
		if (cached) {
			console.error("[currencyRates] Failed to refresh rates, using cached snapshot:", getErrorMessage(error))
			return cached
		}

		throw error
	}
}

export function getCurrencyRate(snapshot: CurrencyRatesSnapshot, currency: string | undefined) {
	if (!currency) {
		return undefined
	}

	const normalized = currency.toUpperCase()
	if (normalized === "RUB" || normalized === "RUR") {
		return 1
	}

	return snapshot.rates[normalized]?.rate
}

export function convertToRub(amount: number | undefined, currency: string | undefined, snapshot: CurrencyRatesSnapshot) {
	if (amount === undefined) {
		return undefined
	}

	const rate = getCurrencyRate(snapshot, currency)
	if (rate === undefined) {
		throw new Error(`Missing CBR rate for ${currency}`)
	}

	return roundTo(amount * rate)
}

export function parseCurrencyRatesXml(xml: string, now = new Date()): CurrencyRatesSnapshot {
	const dateMatch = xml.match(/<ValCurs[^>]*Date="([^"]+)"/i)
	if (!dateMatch) {
		throw new Error("Failed to parse CBR rates date")
	}

	const rates: Record<string, CurrencyRateEntry> = {}
	const valuteMatches = xml.match(/<Valute[\s\S]*?<\/Valute>/gi) ?? []
	for (const valuteXml of valuteMatches) {
		const charCode = readXmlTag(valuteXml, "CharCode")?.toUpperCase()
		const nominal = parseXmlNumber(readXmlTag(valuteXml, "Nominal"))
		const value = parseXmlNumber(readXmlTag(valuteXml, "Value"))

		if (!charCode || nominal === undefined || value === undefined || nominal <= 0) {
			continue
		}

		const rate = roundTo(value / nominal, 6)
		if (rate === undefined) {
			continue
		}

		rates[charCode] = {
			charCode,
			nominal,
			value,
			rate,
		}
	}

	return {
		baseCurrency: "RUB",
		rateDate: dateMatch[1],
		updatedAt: now.toISOString(),
		rates,
	}
}

function parseXmlNumber(value: string | undefined) {
	if (!value) {
		return undefined
	}

	const normalized = Number(value.replace(/\s+/g, "").replace(",", "."))
	return Number.isFinite(normalized) ? normalized : undefined
}

function readXmlTag(xml: string, tag: string) {
	const match = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "i"))
	return match?.[1]?.trim()
}

function isCurrencyRatesSnapshot(value: unknown): value is CurrencyRatesSnapshot {
	return typeof value === "object"
		&& value !== null
		&& "baseCurrency" in value
		&& "rateDate" in value
		&& "updatedAt" in value
		&& "rates" in value
}
