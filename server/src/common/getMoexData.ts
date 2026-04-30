import axios from "axios"
import moment from "moment"
import { createCache } from "./cache"
import { getErrorMessage } from "./utils/error"
import { sleep } from "./utils/sleep"
import { roundTo } from "./utils/round"
import { LiquidityType, MoexCoupon, MoexResults, MoexSecurity, MoexTrade } from "./interfaces/Moex"

const MOEX_REQUEST_DELAY_MS = 100
const MOEX_REQUEST_TIMEOUT_MS = 10_000
const MOEX_MAX_RETRIES = 3
const MOEX_RETRY_BASE_DELAY_MS = 300
const MOEX_BUILD_CONCURRENCY = 8
const MOEX_MARKET_CACHE_TTL_SECONDS = 60 * 60 * 4
const MOEX_DETAILS_CACHE_TTL_SECONDS = 60 * 60 * 6
const MOEX_BOARD_GROUP_IDS = [7, 58, 193] as const
const MOEX_BOND_REQUEST_COLUMNS = "SECID,SECNAME,PREVLEGALCLOSEPRICE,BOARDID,COUPONPERIOD,FACEVALUE,FACEUNIT,SECTYPE"

interface MoexMarketRow {
	marketRow: any[]
	rowData: any[] | undefined
}

interface MoexLiquiditySnapshot {
	trades: MoexTrade[]
	tradeDays: number
	BondVolume: number
	liquidity: LiquidityType
	windowFrom: string
	windowTo: string
}

export interface MoexSecurityRef {
	ticker: string
	boardId?: string
}

function getRetryDelayMs(attempt: number) {
	return MOEX_RETRY_BASE_DELAY_MS * 2 ** (attempt - 1)
}

async function moexGet(url: string) {
	let lastError: unknown

	for (let attempt = 1; attempt <= MOEX_MAX_RETRIES; attempt++) {
		try {
			return await axios.get(url, {
				timeout: MOEX_REQUEST_TIMEOUT_MS,
			})
		} catch (error) {
			lastError = error
			if (attempt < MOEX_MAX_RETRIES) {
				await sleep(getRetryDelayMs(attempt))
			}
		}
	}

	throw lastError
}

export function calculateCouponsYieldForYear(coupons: MoexCoupon[], nowDate = moment()) {
	const oneYearLater = nowDate.clone().add(1, "year")

	return coupons.reduce<number>((acc, coupon) => {
		const couponDate = coupon?.date

		if (!couponDate?.isValid()) {
			return acc
		}

		return couponDate.isAfter(nowDate) && couponDate.isSameOrBefore(oneYearLater)
			? acc + coupon.value
			: acc
	}, 0)
}

export async function mapWithConcurrency<T>(
	items: T[],
	concurrency: number,
	worker: (item: T, index: number) => Promise<void>,
) {
	let nextIndex = 0

	async function runWorker() {
		while (true) {
			const currentIndex = nextIndex
			nextIndex += 1

			if (currentIndex >= items.length) {
				return
			}

			await worker(items[currentIndex], currentIndex)
		}
	}

	await Promise.all(
		Array.from({ length: Math.min(concurrency, items.length) }, () => runWorker()),
	)
}

export async function getMoexMarketData(tickers: string[]): Promise<MoexResults> {
	const cache = createCache({ ttl: MOEX_MARKET_CACHE_TTL_SECONDS })
	const cached = cache.getSync<MoexResults>("moexMarketData")
	if (cached) {
		return filterMoexResultsByTickers(cached, tickers)
	}

	const marketData = await fetchFullMoexMarketData()
	await cache.set("moexMarketData", marketData)
	return filterMoexResultsByTickers(marketData, tickers)
}

export async function getMoexCouponsData(securities: MoexSecurityRef[], nowDate = moment()) {
	const cache = createCache({ ttl: MOEX_DETAILS_CACHE_TTL_SECONDS })
	const result: MoexResults = {}

	await mapWithConcurrency(securities, MOEX_BUILD_CONCURRENCY, async securityRef => {
		const { ticker } = securityRef
		try {
			const cacheKey = `moexCoupons.${ticker}`
			let coupons = await cache.get<MoexCoupon[]>(cacheKey)
			if (coupons && coupons.length > 0) {
				coupons = coupons.map(coupon => ({
					...coupon,
					date: moment(coupon.date),
				}))
			} else {
				await sleep(MOEX_REQUEST_DELAY_MS)
				coupons = await fetchMoexCoupons(ticker)
				await cache.set(cacheKey, coupons)
			}

			result[ticker] = {
				SECID: ticker,
				BOARDID: securityRef.boardId ?? "",
				TYPE: 0,
				FaceValue: 0,
				FaceUnit: coupons[0]?.faceUnit ?? "",
				BondPrice: 0,
				CouponPeriod: 0,
				BondVolume: 0,
				BondYield: 0,
				liquidity: LiquidityType.unknown,
				coupons,
				couponsYield: calculateCouponsYieldForYear(coupons, nowDate),
			}
		} catch (error) {
			console.error(`[getMoexCouponsData] Failed to load coupons for ${ticker}:`, getErrorMessage(error))
		}
	})

	return result
}

export async function getMoexLiquidityData(securities: MoexSecurityRef[]) {
	const cache = createCache({ ttl: MOEX_DETAILS_CACHE_TTL_SECONDS })
	const result: MoexResults = {}
	const nowDate = moment()
	const windowFrom = nowDate.clone().subtract(15, "days").format("YYYY-MM-DD")
	const windowTo = nowDate.format("YYYY-MM-DD")

	await mapWithConcurrency(securities, MOEX_BUILD_CONCURRENCY, async securityRef => {
		const { ticker } = securityRef
		const boardId = securityRef.boardId ?? ""
		if (!boardId) {
			result[ticker] = buildLiquiditySecurity(ticker, boardId, {
				trades: [],
				tradeDays: 0,
				BondVolume: 0,
				liquidity: LiquidityType.low,
				windowFrom,
				windowTo,
			})
			return
		}

		try {
			const cacheKey = `moexTrades.${ticker}.${boardId}`
			let snapshot = await cache.get<MoexLiquiditySnapshot>(cacheKey)
			if (snapshot && snapshot.trades.length > 0) {
				snapshot = {
					...snapshot,
					trades: snapshot.trades.map(trade => ({
						...trade,
						date: moment(trade.date),
					})),
				}
			} else {
				await sleep(MOEX_REQUEST_DELAY_MS)
				snapshot = await fetchMoexLiquiditySnapshot(ticker, boardId, windowFrom, windowTo)
				await cache.set(cacheKey, snapshot)
			}

			result[ticker] = buildLiquiditySecurity(ticker, boardId, snapshot)
		} catch (error) {
			console.error(`[getMoexLiquidityData] Failed to load trades for ${ticker}:`, getErrorMessage(error))
			result[ticker] = buildLiquiditySecurity(ticker, boardId, {
				trades: [],
				tradeDays: 0,
				BondVolume: 0,
				liquidity: LiquidityType.low,
				windowFrom,
				windowTo,
			})
		}
	})

	return result
}

export async function getMoexData(tickers: string[]): Promise<MoexResults> {
	const marketData = await getMoexMarketData(tickers)
	const securityRefs = Object.values(marketData).map(security => ({
		ticker: security.SECID,
		boardId: security.BOARDID,
	}))
	const [couponsData, liquidityData] = await Promise.all([
		getMoexCouponsData(securityRefs),
		getMoexLiquidityData(securityRefs),
	])

	const result: MoexResults = {}
	for (const ticker of tickers) {
		const market = marketData[ticker]
		const coupons = couponsData[ticker]
		const liquidity = liquidityData[ticker]
		if (!market && !coupons && !liquidity) {
			continue
		}

		result[ticker] = {
			...(market ?? createEmptySecurity(ticker)),
			...(liquidity ?? {}),
			coupons: coupons?.coupons,
			couponsYield: coupons?.couponsYield,
		}
		if (market?.FaceUnit && !result[ticker].FaceUnit) {
			result[ticker].FaceUnit = market.FaceUnit
		}
	}

	return result
}

async function fetchFullMoexMarketData() {
	const responses = await Promise.all(MOEX_BOARD_GROUP_IDS.map(boardGroupId =>
		moexGet(buildMoexMarketUrl(boardGroupId)),
	))

	const marketData: MoexResults = {}
	for (const response of responses) {
		Object.assign(marketData, buildMarketDataFromMoex(response.data))
	}

	return marketData
}

function buildMoexMarketUrl(boardGroupId: number) {
	return `https://iss.moex.com/iss/engines/stock/markets/bonds/boardgroups/${boardGroupId}/securities.json?iss.dp=comma&iss.meta=off&iss.only=securities,marketdata&securities.columns=${MOEX_BOND_REQUEST_COLUMNS}&marketdata.columns=SECID,YIELD,DURATION`
}

function buildMarketDataFromMoex(marketData: any): MoexResults {
	const result: MoexResults = {}
	const relevantRows = (marketData?.securities?.data || []).flatMap((marketRow: any[], i: number) => [{
		marketRow,
		rowData: marketData.marketdata.data[i],
	}]) as MoexMarketRow[]

	for (const { marketRow, rowData } of relevantRows) {
		const secId = String(marketRow[0])
		result[secId] = {
			SECID: secId,
			BOARDID: String(marketRow[3] ?? ""),
			TYPE: Number(marketRow[7] ?? 0),
			FaceValue: Number(marketRow[5] ?? 0),
			FaceUnit: String(marketRow[6] ?? ""),
			BondPrice: Number(marketRow[2] ?? 0),
			CouponPeriod: Number(marketRow[4] ?? 0),
			BondVolume: 0,
			BondYield: Number(rowData?.[1] ?? 0),
			BondDuration: roundTo(Number(rowData?.[2] ?? 0) / 30, 2, "floor") ?? 0,
			liquidity: LiquidityType.unknown,
		}
	}

	return result
}

async function fetchMoexCoupons(ticker: string) {
	const coupons: MoexCoupon[] = []
	const responseCoupons = await moexGet(
		`https://iss.moex.com/iss/statistics/engines/stock/markets/bonds/bondization/${ticker}.json?iss.meta=off&iss.only=coupons&coupons.columns=coupondate,faceunit,value,valueprc,value_rub`,
	)

	responseCoupons.data?.coupons?.data?.forEach((resp: any[]) => {
		const coupon: MoexCoupon = {} as MoexCoupon
		coupon.date = moment(resp[0])
		coupon.faceUnit = resp[1]
		coupon.value = Number(resp[2] ?? 0)
		coupon.valuePrc = Number(resp[3] ?? 0)
		coupon.valueRub = Number(resp[4] ?? 0)
		coupons.push(coupon)
	})

	return coupons
}

async function fetchMoexLiquiditySnapshot(ticker: string, boardId: string, windowFrom: string, windowTo: string): Promise<MoexLiquiditySnapshot> {
	const trades: MoexTrade[] = []
	const responseTrades = await moexGet(
		`https://iss.moex.com/iss/history/engines/stock/markets/bonds/boards/${boardId}/securities/${ticker}.json?iss.meta=off&iss.only=history&history.columns=TRADEDATE,VOLUME,NUMTRADES&limit=20&from=${windowFrom}`,
	)

	if (responseTrades.data?.history?.data) {
		responseTrades.data.history.data.forEach((resp: any[]) => {
			const trade: MoexTrade = {} as MoexTrade
			trade.date = moment(resp[0])
			trade.volume = Number(resp[1] ?? 0)
			trade.numTrades = Number(resp[2] ?? 0)
			trades.push(trade)
		})
	}

	if (trades.length < 1) {
		return {
			trades,
			tradeDays: 0,
			BondVolume: 0,
			liquidity: LiquidityType.low,
			windowFrom,
			windowTo,
		}
	}

	let volumeSum = 0
	let lowLiquidity = false
	for (const trade of trades) {
		volumeSum += trade.volume
		if (trade.volume < 1) {
			lowLiquidity = true
		}
	}

	const tradeDays = trades.length
	if (tradeDays < 6) {
		lowLiquidity = true
	}

	return {
		trades,
		tradeDays,
		BondVolume: volumeSum,
		liquidity: lowLiquidity ? LiquidityType.low : LiquidityType.high,
		windowFrom,
		windowTo,
	}
}

function filterMoexResultsByTickers(results: MoexResults, tickers: string[]) {
	const filtered: MoexResults = {}
	for (const ticker of tickers) {
		if (results[ticker]) {
			filtered[ticker] = results[ticker]
		}
	}

	return filtered
}

function createEmptySecurity(ticker: string): MoexSecurity {
	return {
		SECID: ticker,
		BOARDID: "",
		TYPE: 0,
		FaceValue: 0,
		FaceUnit: "",
		BondPrice: 0,
		CouponPeriod: 0,
		BondVolume: 0,
		BondYield: 0,
		liquidity: LiquidityType.unknown,
	}
}

function buildLiquiditySecurity(ticker: string, boardId: string, snapshot: MoexLiquiditySnapshot): MoexSecurity {
	return {
		SECID: ticker,
		BOARDID: boardId,
		TYPE: 0,
		FaceValue: 0,
		FaceUnit: "",
		BondPrice: 0,
		CouponPeriod: 0,
		BondVolume: snapshot.BondVolume,
		BondYield: 0,
		liquidity: snapshot.liquidity,
		tradeDays: snapshot.tradeDays,
		trades: snapshot.trades,
	}
}
