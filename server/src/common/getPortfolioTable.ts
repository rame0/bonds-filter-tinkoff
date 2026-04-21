import moment from "moment"
import { getCouponSummary, type CouponSummary } from "./getCouponSummary"
import { roundTo } from "./utils/round"
import { CombinedBondsResponse } from "./interfaces/CombinedBondsResponse"
import { type CombinedCoupon } from "./interfaces/CombinedCoupon"
import { type PortfolioPositionInput } from "./interfaces/PortfolioMetrics"
import { type PortfolioCouponTooltip, type PortfolioCouponTooltipGroup, type PortfolioTableResponse, type PortfolioTableRow } from "./interfaces/PortfolioTable"

export async function getPortfolioTable(
	positions: PortfolioPositionInput[],
	bonds: CombinedBondsResponse[],
	now = moment(),
): Promise<PortfolioTableResponse> {
	const bondByUid = new Map(bonds.map(bond => [bond.uid, bond]))
	const rows: PortfolioTableRow[] = []

	for (const position of positions) {
		const qty = Math.max(0, Math.trunc(position.qty))
		if (qty < 1) {
			continue
		}

		const bond = bondByUid.get(position.uid)
		if (!bond) {
			continue
		}

		const couponSummary = await resolveCouponSummary(bond, now)
		const currency = normalizeCurrency(bond.currency)
		const nominal = roundTo(bond.nominal)
		const aciValue = roundTo(bond.aciValue) ?? 0
		const fullPrice = nominal !== undefined && bond.price !== undefined
			? roundTo((nominal * bond.price) / 100 + aciValue)
			: roundTo(bond.realPrice)
		const positionCost = fullPrice !== undefined ? roundTo(fullPrice * qty) : undefined

		rows.push({
			uid: normalizeString(bond.uid, position.uid),
			name: normalizeString(bond.name),
			ticker: normalizeString(bond.ticker),
			qty,
			currency,
			displayDate: normalizeDateString(bond.buyBackDate) ?? normalizeDateString(bond.maturityDate),
			pricePct: roundTo(bond.price),
			nominal,
			aciValue,
			fullPrice,
			positionCost,
			bondYield: roundTo(bond.bondYield),
			couponCountLeft: couponSummary?.leftCouponCount ?? 0,
			couponTooltip: buildCouponTooltip(couponSummary?.coupons ?? [], currency, bond),
			couponMonths: buildCouponMonths(couponSummary?.coupons ?? [], now),
			sector: typeof bond.sector === "string" ? bond.sector : "other",
			riskLevel: Number(bond.riskLevel ?? 0),
			liquidity: bond.liquidity,
		})
	}

	return { rows }
}

async function resolveCouponSummary(bond: CombinedBondsResponse, now: moment.Moment): Promise<CouponSummary | undefined> {
	if (Array.isArray(bond.coupons) && bond.leftCouponCount !== undefined) {
		return {
			coupons: bond.coupons,
			annualCouponSum: bond.couponsYield,
			leftToPay: bond.leftToPay,
			leftCouponCount: bond.leftCouponCount,
		}
	}

	return getCouponSummary(String(bond.figi), Boolean(bond.floatingCouponFlag), now)
}

function normalizeCurrency(currency: unknown) {
	return typeof currency === "string" && currency ? currency.toUpperCase() : "RUB"
}

function normalizeString(value: unknown, fallback = "") {
	return typeof value === "string" ? value : fallback
}

function normalizeDateString(value: unknown) {
	if (!(value instanceof Date) && typeof value !== "string") {
		return undefined
	}

	const date = moment(value)
	return date.isValid() ? date.toISOString() : undefined
}

function buildCouponTooltip(
	coupons: CombinedCoupon[],
	currency: string,
	bond: CombinedBondsResponse,
): PortfolioCouponTooltip {
	const grouped = new Map<number, number>()
	let isEstimated = false

	for (const coupon of coupons) {
		const payout = roundTo(coupon.payout)
		if (payout === undefined || payout <= 0) {
			continue
		}

		grouped.set(payout, (grouped.get(payout) ?? 0) + 1)
		isEstimated = isEstimated || Boolean(coupon.isEstimated)
	}

	const groups: PortfolioCouponTooltipGroup[] = Array.from(grouped.entries())
		.sort((a, b) => b[0] - a[0])
		.map(([amount, count]) => ({
			count,
			amount,
			currency,
		}))

	return {
		groups,
		isEstimated,
		isFloating: Boolean(bond.floatingCouponFlag),
		isAmortizing: Boolean(bond.amortizationFlag),
	}
}

function buildCouponMonths(coupons: CombinedCoupon[], now: moment.Moment) {
	const months = Array.from({ length: 12 }, () => false)
	const monthsHorizon = now.clone().add(14, "months")

	for (const coupon of coupons) {
		const date = moment(coupon.couponDate)
		if (!date.isValid() || date.isAfter(monthsHorizon)) {
			continue
		}

		months[date.month()] = true
	}

	return months
}
