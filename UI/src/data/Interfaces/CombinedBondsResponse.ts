import type { Bond } from "./BondsResoinse"
import type { CombinedCoupon } from "./CombinedCoupon"

export enum LiquidityType {
	unknown = 0,
	low = 1,
	high = 2
}

export interface CombinedBondsResponse
	extends Omit<
		Bond,
		| "klong"
		| "kshort"
		| "dlong"
		| "dshort"
		| "dlongMin"
		| "dshortMin"
		| "minPriceIncrement"
		| "nominal"
		| "initialNominal"
		| "placementPrice"
		| "aciValue"
	> {
	klong?: number
	kshort?: number
	dlong?: number
	dshort?: number
	dlongMin?: number
	dshortMin?: number
	minPriceIncrement?: number
	nominal?: number
	initialNominal?: number
	placementPrice?: number
	aciValue?: number
	price?: number
	realPrice?: number
	volume?: number
	duration?: number
	durationSource?: string
	liquidity?: LiquidityType
	liquiditySource?: string
	coupons?: CombinedCoupon[]
	couponsYield?: number
	couponsYieldSource?: string
	leftCouponCount?: number
	leftToPay?: number
	buyBackDate?: Date | string
	yield?: number
	bondYield: number
	bondYieldSource?: string
	couponProjectionQuality?: string
	qty: number
}
