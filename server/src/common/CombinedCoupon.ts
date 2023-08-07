import { Coupon } from "@psqq/tinkoff-invest-api/cjs/generated/instruments"
import { MoneyValue, Quotation } from "@psqq/tinkoff-invest-api/src/generated/common"

export interface CombinedCoupon extends Omit<Coupon, "payout"> {
	payout?: number,
	isPaid?: boolean,
}
