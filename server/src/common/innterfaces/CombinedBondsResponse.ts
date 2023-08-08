import { Bond } from "@psqq/tinkoff-invest-api/cjs/generated/instruments"
import { CombinedCoupon } from "./CombinedCoupon"

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
	leftCouponCount?: number,
	leftToPay?: number,
	buyBackDate?: Date,
	yieldToMaturity?: number,
	yieldToBuyBack?: number,

	price?: number,
	realPrice?: number,
}
