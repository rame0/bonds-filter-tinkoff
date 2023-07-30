import { Bond, Coupon } from "@psqq/tinkoff-invest-api/cjs/generated/instruments"
import { Quotation } from "@psqq/tinkoff-invest-api/src/generated/common"

export interface CombinedBondsResponse extends Bond{
	coupons?: Coupon[],
	lastPrice?: Quotation,
}
