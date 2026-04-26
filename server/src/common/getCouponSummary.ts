import moment from "moment/moment"
import { createCache } from "./cache"
import { CombinedCoupon } from "./interfaces/CombinedCoupon"
import { getBondCoupons } from "./investApiFacade"
import { getErrorMessage } from "./utils/error"
import { toNumber } from "./utils/money"
import { roundTo } from "./utils/round"
import { sleep } from "./utils/sleep"

const COUPON_FALLBACK_DELAY_MS = 400
const COUPON_FALLBACK_MAX_RETRIES = 4
const COUPON_FALLBACK_CACHE_TTL_SECONDS = 60 * 60 * 24

export interface CouponSummary {
	coupons: CombinedCoupon[]
	annualCouponSum?: number
	leftToPay?: number
	leftCouponCount: number
}

const couponCache = createCache({ ttl: COUPON_FALLBACK_CACHE_TTL_SECONDS })

export async function getCouponSummary(
	figi: string,
	isFloatingCoupon: boolean,
	now = moment(),
): Promise<CouponSummary | undefined> {
	const cacheKey = `bondCoupons.${figi}`
	const cachedSummary = await couponCache.get(cacheKey) as CouponSummary | undefined
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
		isEstimated: isEstimatedCouponPayout(coupon, isFloatingCoupon, lastKnownPayout),
		payout: getCouponPayout(coupon, isFloatingCoupon, lastKnownPayout),
	}))
	const oneYearLater = now.clone().add(1, "year")
	const annualCouponSum = roundTo(normalizedCoupons.reduce((sum, coupon) =>
		moment(coupon.couponDate).isSameOrBefore(oneYearLater)
			? sum + (coupon.payout ?? 0)
			: sum
	, 0))
	const leftToPay = roundTo(normalizedCoupons.reduce((sum, coupon) => sum + (coupon.payout ?? 0), 0))
	const couponSummary: CouponSummary = {
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
			if (!getErrorMessage(error).includes("RESOURCE_EXHAUSTED") || attempt === COUPON_FALLBACK_MAX_RETRIES) {
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

function isEstimatedCouponPayout(
	coupon: { payOneBond?: { units: number, nano: number } },
	isFloatingCoupon: boolean,
	lastKnownPayout?: number,
) {
	const payout = roundTo(toNumber(coupon.payOneBond))
	if (payout !== undefined && payout > 0) {
		return false
	}

	return isFloatingCoupon && lastKnownPayout !== undefined
}
