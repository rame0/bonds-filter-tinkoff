import axios from "axios"
import moment from "moment"
import { createCache } from "./cache"
import { getErrorMessage } from "./utils/error"
import { sleep } from "./utils/sleep"
import { roundTo } from "./utils/round"
import { LiquidityType, MoexCoupon, MoexResults, MoexTrade } from "./interfaces/Moex"

const MOEX_REQUEST_DELAY_MS = 100
const MOEX_REQUEST_TIMEOUT_MS = 10_000
const MOEX_MAX_RETRIES = 3
const MOEX_RETRY_BASE_DELAY_MS = 300
const MOEX_BUILD_CONCURRENCY = 8

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

export function getMoexData(tickers: string[]): Promise<MoexResults> {
	  return new Promise((resolve, reject) => {
	    const cache = createCache({ ttl: 60 * 60 * 4 })

	    const moexData = cache.getSync<MoexResults>("moexData")
	    if (moexData) {
	      resolve(moexData)
    } else {
      const bondRequestColumns = "SECID,SECNAME,PREVLEGALCLOSEPRICE,BOARDID,COUPONPERIOD,FACEVALUE,FACEUNIT,SECTYPE"
      const url1 = `https://iss.moex.com/iss/engines/stock/markets/bonds/boardgroups/7/securities.json?iss.dp=comma&iss.meta=off&iss.only=securities,marketdata&securities.columns=${bondRequestColumns}&marketdata.columns=SECID,YIELD,DURATION`
      const url2 = `https://iss.moex.com/iss/engines/stock/markets/bonds/boardgroups/58/securities.json?iss.dp=comma&iss.meta=off&iss.only=securities,marketdata&securities.columns=${bondRequestColumns}&marketdata.columns=SECID,YIELD,DURATION`
      const url3 = `https://iss.moex.com/iss/engines/stock/markets/bonds/boardgroups/193/securities.json?iss.dp=comma&iss.meta=off&iss.only=securities,marketdata&securities.columns=${bondRequestColumns}&marketdata.columns=SECID,YIELD,DURATION`

      let marketData: MoexResults = {}

      Promise.all([moexGet(url1), moexGet(url2), moexGet(url3)])
        .then(async ([firstResponse, secondResponse, thirdResponse]) => {
          const md1 = await buildDataFromMoex(firstResponse.data, tickers)
          const md2 = await buildDataFromMoex(secondResponse.data, tickers)
          const md3 = await buildDataFromMoex(thirdResponse.data, tickers)
          marketData = { ...md1, ...md2, ...md3 }

          await cache.set("moexData", marketData)
          resolve(marketData)
        })
        .catch(error => {
          console.error("[getMoexData] MOEX request failed:", getErrorMessage(error))
          reject(error)
        })
    }
  })
}

export async function buildDataFromMoex(marketData, tickers: string[]) {
  const cache = createCache({ ttl: 60 * 60 * 6 })
  const DateRequestPrevious = moment().subtract(15, "days").format("YYYY-MM-DD")

  const result: MoexResults = {}

  const relevantRows = (marketData?.securities?.data || []).flatMap((marketRow, i) => {
    const secId: string = marketRow[0]
    if (!tickers.includes(secId)) {
      return []
    }

    return [{ marketRow, rowData: marketData.marketdata.data[i] }]
  }) as { marketRow: any[]; rowData: any[] | undefined }[]

  await mapWithConcurrency(relevantRows, MOEX_BUILD_CONCURRENCY, async ({ marketRow, rowData }) => {
    const secId: string = marketRow[0]

    try {
      result[secId] = {
        SECID: secId,
        BOARDID: marketRow[3],
        TYPE: +marketRow[7],
        FaceValue: marketRow[5],
        FaceUnit: marketRow[6],
        BondPrice: marketRow[2],
        CouponPeriod: marketRow[4],
        BondVolume: -1,
        BondYield: +(rowData?.[1] ?? 0),
        BondDuration: roundTo((rowData?.[2] ?? 0) / 30, 2, "floor") ?? 0,
        liquidity: LiquidityType.high,
      }

      const security = result[secId]

      security.coupons = await cache.get(`moexData.${secId}.coupons`)

      if (security.coupons && security.coupons.length > 0) {
		security.coupons.forEach(coupon => {
          coupon.date = moment(coupon.date)
        })
      } else {
        await sleep(MOEX_REQUEST_DELAY_MS)
		security.coupons = []
		const responseCoupons = await moexGet(
		  `https://iss.moex.com/iss/statistics/engines/stock/markets/bonds/bondization/${secId}.json?iss.meta=off&iss.only=coupons&coupons.columns=coupondate,faceunit,value,valueprc,value_rub`,
		)
		responseCoupons.data?.coupons?.data?.forEach(resp => {
          const coupon: MoexCoupon = {} as MoexCoupon
          coupon.date = moment(resp[0])
          coupon.faceUnit = resp[1]
          coupon.value = +resp[2]
          coupon.valuePrc = +resp[3]
          coupon.valueRub = +resp[4]
		  security.coupons?.push(coupon)
        })

		await cache.set(`moexData.${secId}.coupons`, security.coupons)
      }

      const nowDate = moment()
      security.couponsYield = calculateCouponsYieldForYear(security.coupons ?? [], nowDate)

      security.trades = await cache.get(`moexData.${secId}.trades`)

      if (security.trades && security.trades.length > 0) {
		security.trades = security.trades.map(trade => {
          trade.date = moment(trade.date)
          return trade
        })
      } else {
		security.trades = []
        await sleep(MOEX_REQUEST_DELAY_MS)
		const responseTrades = await moexGet(
		  `https://iss.moex.com/iss/history/engines/stock/markets/bonds/boards/${security.BOARDID}/securities/${secId}.json?iss.meta=off&iss.only=history&history.columns=TRADEDATE,VOLUME,NUMTRADES&limit=20&from=${DateRequestPrevious}`,
		)

        if (!responseTrades.data?.history) {
		  security.BondVolume = 0
		  security.liquidity = LiquidityType.low
		  security.tradeDays = 0
        } else {
		  responseTrades.data?.history?.data?.forEach(resp => {
            const trade: MoexTrade = {} as MoexTrade
            trade.date = moment(resp[0])
            trade.volume = +resp[1]
            trade.numTrades = +resp[2]
			security.trades?.push(trade)
          })
        }

		await cache.set(`moexData.${secId}.trades`, security.trades)
      }

	  if ((security.trades?.length ?? 0) < 1) {
		security.BondVolume = 0
		security.liquidity = LiquidityType.low
		security.tradeDays = 0
		return
	  }

      let volumeSum = 0
      let lowLiquidity = false

	  for (const histItem of security.trades ?? []) {
        const volume = histItem.volume
        volumeSum += volume
        if (1 > volume) {
          lowLiquidity = true
        }
      }
	  security.tradeDays = security.trades?.length ?? 0
	  if (security.tradeDays < 6) {
		lowLiquidity = true
	  }

	  security.liquidity = lowLiquidity ? LiquidityType.low : LiquidityType.high
	  security.BondVolume = volumeSum
    } catch (err) {
	  console.error(`[buildDataFromMoex] Failed to process ${secId}:`, getErrorMessage(err))
      if (result[secId]) {
        result[secId].BondVolume = 0
        result[secId].liquidity = LiquidityType.low
        result[secId].tradeDays = 0
      }
    }
  })

  return result
}
