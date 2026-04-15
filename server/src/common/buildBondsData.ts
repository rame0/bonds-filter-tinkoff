import moment from "moment/moment"
import { getMoexData } from "./getMoexData"
import { mapWithConcurrency } from "./getMoexData"
import { CombinedBondsResponse } from "./interfaces/CombinedBondsResponse"
import { listBonds, getLastPrices, getBondCoupons } from "./investApiFacade"
import { isMoneyLike, toNumber } from "./utils/money"
import { roundTo } from "./utils/round"

const COUPON_FALLBACK_CONCURRENCY = 8

export async function buildBondsData(): Promise<CombinedBondsResponse[]> {
  const bonds = await listBonds()

  const instrumentIDs: string[] = bonds.map(instrument => instrument.uid)
  const tickers = bonds.map(instrument => instrument.ticker)
  const prices = await getLastPrices(instrumentIDs)

  const moexBonds = await getMoexData(tickers)
  const lastPriceByFigi = new Map(prices.map(item => [item.figi, item.price]))

  const response: CombinedBondsResponse[] = []
  const now = moment()
  for (const t1 of bonds) {
    const instrument: CombinedBondsResponse = {} as CombinedBondsResponse
    for (const key of Object.keys(t1)) {
      if (t1[key] === undefined) {
        instrument[key] = undefined
      } else if (isMoneyLike(t1[key])) {
        instrument[key] = toNumber(t1[key])
      } else {
        instrument[key] = t1[key]
      }
    }
    const lastPrice = lastPriceByFigi.get(t1.figi)
    instrument.price = roundTo(toNumber(lastPrice))
    instrument.couponsYield = moexBonds[t1.ticker]?.couponsYield !== undefined
      ? roundTo(moexBonds[t1.ticker].couponsYield)
      : undefined
    instrument.bondYield = moexBonds[t1.ticker]?.BondYield !== undefined
      ? roundTo(moexBonds[t1.ticker].BondYield)
      : undefined
    instrument.duration = moexBonds[t1.ticker]?.BondDuration !== undefined
      ? roundTo(moexBonds[t1.ticker].BondDuration)
      : undefined
    if (instrument.duration === undefined || instrument.duration <= 0) {
      const dateStr = instrument.buyBackDate ? instrument.buyBackDate : instrument.maturityDate || ""
      const date = moment(dateStr)

      instrument.duration = roundTo(date.diff(now, "days") / 30) || 0
    }
    instrument.liquidity = moexBonds[t1.ticker]?.liquidity

    response.push(instrument)
  }

  const bondsMissingMoexData = response.filter(instrument => instrument.couponsYield === undefined || instrument.bondYield === undefined)

  await mapWithConcurrency(bondsMissingMoexData, COUPON_FALLBACK_CONCURRENCY, async instrument => {
    try {
      const coupons = await getBondCoupons(String(instrument.figi))
      const futureCoupons = coupons
        .filter(coupon => moment(coupon.couponDate).isAfter(now))
        .sort((a, b) => moment(a.couponDate).valueOf() - moment(b.couponDate).valueOf())

      if (futureCoupons.length < 1) {
        return
      }

      const normalizedCoupons = futureCoupons.map(coupon => ({
        ...coupon,
        payout: roundTo(toNumber(coupon.payOneBond)),
      }))
      const oneYearLater = now.clone().add(1, "year")
      const annualCouponSum = roundTo(normalizedCoupons.reduce((sum, coupon) => {
        return moment(coupon.couponDate).isSameOrBefore(oneYearLater)
          ? sum + (coupon.payout ?? 0)
          : sum
      }, 0))
      const leftToPay = roundTo(normalizedCoupons.reduce((sum, coupon) => sum + (coupon.payout ?? 0), 0))
      const nominal = roundTo(instrument.nominal)
      const aciValue = roundTo(instrument.aciValue) ?? 0
      const realPrice = nominal !== undefined && instrument.price !== undefined
        ? roundTo((nominal * instrument.price) / 100 + aciValue)
        : undefined

      instrument.coupons = normalizedCoupons
      instrument.leftCouponCount = normalizedCoupons.length
      instrument.leftToPay = leftToPay
      instrument.realPrice = realPrice
      instrument.couponsYield ??= annualCouponSum

      if (instrument.bondYield === undefined && realPrice !== undefined && realPrice > 0 && annualCouponSum !== undefined) {
        // MOEX yield is missing for some bonds. Fall back to current annual coupon yield.
        instrument.bondYield = roundTo((annualCouponSum / realPrice) * 100)
      }
    } catch (error) {
      console.error(`[buildBondsData] Failed to backfill coupon data for ${instrument.figi}:`, error?.message ?? error)
    }
  })

  return response
}
