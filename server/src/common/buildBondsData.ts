import moment from "moment/moment"
import { createCache } from "./cache"
import { getMoexData } from "./getMoexData"
import { mapWithConcurrency } from "./getMoexData"
import { CombinedBondsResponse } from "./interfaces/CombinedBondsResponse"
import { listBonds, getLastPrices, getBondCoupons } from "./investApiFacade"
import { isMoneyLike, toNumber } from "./utils/money"
import { roundTo } from "./utils/round"
import { sleep } from "./utils/sleep"

const COUPON_FALLBACK_CONCURRENCY = 1
const COUPON_FALLBACK_DELAY_MS = 400
const COUPON_FALLBACK_MAX_RETRIES = 4
const COUPON_FALLBACK_CACHE_TTL_SECONDS = 60 * 60 * 24

interface CachedCouponSummary {
	coupons: { couponDate?: string | Date, payout?: number, couponNumber?: number }[]
	annualCouponSum?: number
	leftToPay?: number
	leftCouponCount: number
}

export async function buildBondsData(): Promise<CombinedBondsResponse[]> {
  const couponCache = createCache({ ttl: COUPON_FALLBACK_CACHE_TTL_SECONDS })
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

  const bondsMissingMoexData = response.filter(instrument => {
    const missingCouponsYield = instrument.couponsYield === undefined || instrument.couponsYield <= 0
    const missingBondYield = instrument.bondYield === undefined

    return missingCouponsYield || missingBondYield
  })

  await mapWithConcurrency(bondsMissingMoexData, COUPON_FALLBACK_CONCURRENCY, async instrument => {
    try {
      const couponSummary = await getCouponSummary(String(instrument.figi), Boolean(instrument.floatingCouponFlag), couponCache, now)
      if (!couponSummary) {
        return
      }
      const nominal = roundTo(instrument.nominal)
      const aciValue = roundTo(instrument.aciValue) ?? 0
      const realPrice = nominal !== undefined && instrument.price !== undefined
        ? roundTo((nominal * instrument.price) / 100 + aciValue)
        : undefined

      instrument.coupons = couponSummary.coupons
      instrument.leftCouponCount = couponSummary.leftCouponCount
      instrument.leftToPay = couponSummary.leftToPay
      instrument.realPrice = realPrice
      if (instrument.couponsYield === undefined || instrument.couponsYield <= 0) {
        instrument.couponsYield = couponSummary.annualCouponSum
      }

      if (instrument.bondYield === undefined && realPrice !== undefined && realPrice > 0 && couponSummary.annualCouponSum !== undefined) {
        // MOEX yield is missing for some bonds. Fall back to current annual coupon yield.
        instrument.bondYield = roundTo((couponSummary.annualCouponSum / realPrice) * 100)
      }
    } catch (error) {
      console.error(`[buildBondsData] Failed to backfill coupon data for ${instrument.figi}:`, error?.message ?? error)
    }
  })

  return response
}

async function getCouponSummary(figi: string, isFloatingCoupon: boolean, couponCache, now: moment.Moment): Promise<CachedCouponSummary | undefined> {
	const cacheKey = `bondCoupons.${figi}`
	const cachedSummary = await couponCache.get(cacheKey) as CachedCouponSummary | undefined
	if (cachedSummary) {
		return cachedSummary
	}

	const coupons = await getBondCouponsWithRetry(figi)
	const futureCoupons = coupons
		.filter(coupon => moment(coupon.couponDate).isAfter(now))
		.sort((a, b) => moment(a.couponDate).valueOf() - moment(b.couponDate).valueOf())

	if (futureCoupons.length < 1) {
		return undefined
	}

	const lastKnownPayout = findLastKnownPayout(coupons)
	const normalizedCoupons = futureCoupons.map(coupon => ({
		couponDate: coupon.couponDate,
		couponNumber: coupon.couponNumber,
		payout: getCouponPayout(coupon, isFloatingCoupon, lastKnownPayout),
	}))
	const oneYearLater = now.clone().add(1, "year")
	const annualCouponSum = roundTo(normalizedCoupons.reduce((sum, coupon) =>
		moment(coupon.couponDate).isSameOrBefore(oneYearLater)
			? sum + (coupon.payout ?? 0)
			: sum
	, 0))
	const leftToPay = roundTo(normalizedCoupons.reduce((sum, coupon) => sum + (coupon.payout ?? 0), 0))
	const couponSummary: CachedCouponSummary = {
		coupons: normalizedCoupons,
		annualCouponSum,
		leftToPay,
		leftCouponCount: normalizedCoupons.length,
	}

	await couponCache.set(cacheKey, couponSummary)
	return couponSummary
}

async function getBondCouponsWithRetry(figi: string) {
	let lastError: unknown

	for (let attempt = 1; attempt <= COUPON_FALLBACK_MAX_RETRIES; attempt++) {
		try {
			if (attempt > 1) {
				await sleep(COUPON_FALLBACK_DELAY_MS * attempt)
			}
			const coupons = await getBondCoupons(figi)
			await sleep(COUPON_FALLBACK_DELAY_MS)
			return coupons
		} catch (error) {
			lastError = error
			if (!String(error?.message ?? error).includes("RESOURCE_EXHAUSTED") || attempt === COUPON_FALLBACK_MAX_RETRIES) {
				throw error
			}
		}
	}

	throw lastError
}

function findLastKnownPayout(coupons: { payOneBond?: { units: number, nano: number } }[]) {
	for (const coupon of coupons) {
		const payout = roundTo(toNumber(coupon.payOneBond))
		if (payout !== undefined && payout > 0) {
			return payout
		}
	}

	return undefined
}

function getCouponPayout(
	coupon: { payOneBond?: { units: number, nano: number } },
	isFloatingCoupon: boolean,
	lastKnownPayout?: number,
) {
	const payout = roundTo(toNumber(coupon.payOneBond))
	if (payout !== undefined && payout > 0) {
		return payout
	}

	return isFloatingCoupon ? lastKnownPayout : payout
}
