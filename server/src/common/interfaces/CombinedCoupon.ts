import type { ApiCoupon } from "./InvestApi"

export interface CombinedCoupon extends Omit<ApiCoupon, "payout"> {
	payout?: number,
	isPaid?: boolean,
	isEstimated?: boolean,
}
