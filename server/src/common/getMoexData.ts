import axios from "axios"
import moment from "moment"
import Cache from "file-system-cache"
import { sleep } from "./utils/sleep"
import { roundTo } from "./utils/round"
import { LiquidityType, MoexCoupon, MoexResults, MoexTrade } from "./interfaces/Moex"

const MOEX_REQUEST_DELAY_MS = 100
const MOEX_REQUEST_TIMEOUT_MS = 10_000
const MOEX_MAX_RETRIES = 3
const MOEX_RETRY_BASE_DELAY_MS = 300

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

export function getMoexData(tickers: string[]): Promise<MoexResults> {
  return new Promise((resolve, reject) => {
    const cache = Cache({ ttl: 60 * 60 * 4 })

    const moexData = cache.getSync("moexData")
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
          console.error("[getMoexData] MOEX request failed:", error?.message ?? error)
          reject(error)
        })
    }
  })
}

export async function buildDataFromMoex(marketData, tickers: string[]) {
  const cache = Cache({ ttl: 60 * 60 * 6 })
  const DateRequestPrevious = moment().subtract(15, "days").format("YYYY-MM-DD")

  const result: MoexResults = {}
  // let skipped = 0

  for (let i = 0; i < marketData?.securities?.data?.length; i++) {
    const marketRow = marketData.securities.data[i]
    const rowData = marketData.marketdata.data[i]

    const secId: string = marketRow[0]
    if (!tickers.includes(secId)) {
      // console.log("skipped", ++skipped)
      continue
    }

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
        BondYield: +rowData[1],
        BondDuration: roundTo(rowData[2] / 30, 2, "floor") ?? 0,
        MonthsOfPaymentsDates: null,
        liquidity: LiquidityType.high,
      }

      result[secId].coupons = await cache.get(`moexData.${secId}.coupons`)

      if (result[secId].coupons && result[secId].coupons.length > 0) {
        result[secId].coupons.forEach(coupon => {
          coupon.date = moment(coupon.date)
        })
      } else {
        await sleep(MOEX_REQUEST_DELAY_MS)
        result[secId].coupons = []
        const responseCoupons = await moexGet(
          `https://iss.moex.com/iss/statistics/engines/stock/markets/bonds/bondization/${secId}.json?iss.meta=off&iss.only=coupons&coupons.columns=coupondate,faceunit,value,valueprc,value_rub`
        )
        responseCoupons.data?.coupons?.data.forEach(resp => {
          const coupon: MoexCoupon = {} as MoexCoupon
          coupon.date = moment(resp[0])
          coupon.faceUnit = resp[1]
          coupon.value = +resp[2]
          coupon.valuePrc = +resp[3]
          coupon.valueRub = +resp[4]
          result[secId].coupons.push(coupon)
        })

        await cache.set(`moexData.${secId}.coupons`, result[secId].coupons)
      }

      const nowDate = moment()
      result[secId].couponsYield = calculateCouponsYieldForYear(result[secId].coupons, nowDate)

      result[secId].trades = await cache.get(`moexData.${secId}.trades`)

      if (result[secId].trades && result[secId].trades.length > 0) {
        result[secId].trades = result[secId].trades.map(trade => {
          trade.date = moment(trade.date)
          return trade
        })
      } else {
        result[secId].trades = []
        await sleep(MOEX_REQUEST_DELAY_MS)
        const responseTrades = await moexGet(
          `https://iss.moex.com/iss/history/engines/stock/markets/bonds/boards/${result[secId].BOARDID}/securities/${secId}.json?iss.meta=off&iss.only=history&history.columns=TRADEDATE,VOLUME,NUMTRADES&limit=20&from=${DateRequestPrevious}`
        )

        if (!responseTrades.data?.history) {
          result[secId].BondVolume = 0
          result[secId].liquidity = LiquidityType.low
          result[secId].tradeDays = 0
        } else {
          responseTrades.data?.history?.data.forEach(resp => {
            const trade: MoexTrade = {} as MoexTrade
            trade.date = moment(resp[0])
            trade.volume = +resp[1]
            trade.numTrades = +resp[2]
            result[secId].trades.push(trade)
          })
        }

        await cache.set(`moexData.${secId}.trades`, result[secId].trades)
      }

      if (result[secId].trades.length < 1) {
        result[secId].BondVolume = 0
        result[secId].liquidity = LiquidityType.low
        result[secId].tradeDays = 0
        continue
      }

      let volumeSum = 0
      let lowLiquidity = false

      for (const histItem of result[secId].trades) {
        const volume = histItem.volume
        volumeSum += volume
        if (1 > volume) {
          // если оборот в конкретный день меньше
          lowLiquidity = true
        }
      }
      result[secId].tradeDays = result[secId].trades.length
      if (result[secId].tradeDays < 6) {
        // если всего дней в апи на этом периоде очень мало
        lowLiquidity = true
      }

      result[secId].liquidity = lowLiquidity ? LiquidityType.low : LiquidityType.high
      result[secId].BondVolume = volumeSum
    } catch (err) {
      console.error(`[buildDataFromMoex] Failed to process ${secId}:`, err?.message ?? err)
      if (result[secId]) {
        result[secId].BondVolume = 0
        result[secId].liquidity = LiquidityType.low
        result[secId].tradeDays = 0
      }
      continue
    }
  }

  return result
}
