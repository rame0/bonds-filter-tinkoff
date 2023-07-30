import { Bond, Coupon } from "@psqq/tinkoff-invest-api/cjs/generated/instruments"
import { MoneyValue, Quotation } from "@psqq/tinkoff-invest-api/src/generated/common"

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

	coupons?: Coupon[],
	price?: number,
}
