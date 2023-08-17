import { Bond } from "@psqq/tinkoff-invest-api/cjs/generated/instruments"
import { type CombinedCoupon } from "./CombinedCoupon"
import { LiquidityType } from "./Moex"

export interface CombinedBondsResponse extends Omit<Bond, "klong" | "kshort" | "dlong"
	| "dshort" | "dlongMin" | "dshortMin" | "minPriceIncrement"
	| "nominal" | "initialNominal" | "placementPrice" | "aciValue"
	| "price"> {
	klong?: number,
	kshort?: number,
	dlong?: number,
	dshort?: number,
	dlongMin?: number,
	dshortMin?: number,
	minPriceIncrement?: number;

	nominal?: number;
	initialNominal?: number;
	placementPrice?: number;
	aciValue?: number;

	coupons?: CombinedCoupon[],
	couponsYield?: number,
	leftCouponCount?: number,
	leftToPay?: number,
	buyBackDate?: Date,
	yield?: number,
	bondYield: number,

	price?: number,
	realPrice?: number,
	volume?: number,
	duration?: number,
	liquidity?: LiquidityType,
}
