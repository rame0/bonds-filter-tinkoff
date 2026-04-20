import moment from "moment"
import { getCouponSummary, type CouponSummary } from "./getCouponSummary"
import { convertToRub, type CurrencyRatesSnapshot } from "./getCurrencyRates"
import { CombinedBondsResponse } from "./interfaces/CombinedBondsResponse"
import { type BondsDataStatus } from "./interfaces/BondsDataStatus"
import {
	type PortfolioCouponScheduleItem,
	type PortfolioMetricsResponse,
	type PortfolioPositionInput,
	type PortfolioSectorAllocationItem,
} from "./interfaces/PortfolioMetrics"
import { roundTo } from "./utils/round"

export async function getPortfolioMetrics(
	positions: PortfolioPositionInput[],
	bonds: CombinedBondsResponse[],
	rates: CurrencyRatesSnapshot,
	bondsStatus: BondsDataStatus,
	now = moment(),
): Promise<PortfolioMetricsResponse> {
	const bondByUid = new Map(bonds.map(bond => [bond.uid, bond]))
	const scheduleByMonth = new Map<string, number>()
	const sectorAmounts = new Map<string, number>()
	let totalBonds = 0
	let totalCoupons = 0
	let purchaseCostRub = 0
	let couponProfitRub = 0
	let maturityProfitRub = 0

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
		const nominal = bond.nominal ?? 0
		const aciValue = bond.aciValue ?? 0
		const bondCurrency = typeof bond.currency === "string" ? bond.currency : undefined
		const cleanPrice = nominal > 0 && bond.price !== undefined ? (nominal * bond.price) / 100 : 0
		const purchaseCostLocal = (cleanPrice + aciValue) * qty
		const couponProfitLocal = (couponSummary?.leftToPay ?? 0) * qty
		const maturityProfitLocal = (nominal + (couponSummary?.leftToPay ?? 0) - cleanPrice - aciValue) * qty
		const sectorAmountLocal = cleanPrice * qty

		totalBonds += qty
		totalCoupons += (couponSummary?.leftCouponCount ?? 0) * qty
		purchaseCostRub += convertToRub(purchaseCostLocal, bondCurrency, rates) ?? 0
		couponProfitRub += convertToRub(couponProfitLocal, bondCurrency, rates) ?? 0
		maturityProfitRub += convertToRub(maturityProfitLocal, bondCurrency, rates) ?? 0

		const sectorAmountRub = convertToRub(sectorAmountLocal, bondCurrency, rates) ?? 0
		const sectorKey = typeof bond.sector === "string" && bond.sector ? bond.sector : "other"
		sectorAmounts.set(sectorKey, roundTo((sectorAmounts.get(sectorKey) ?? 0) + sectorAmountRub) ?? 0)

		for (const coupon of couponSummary?.coupons ?? []) {
			const couponDate = moment(coupon.couponDate)
			if (!couponDate.isValid()) {
				continue
			}

			const monthDiff = couponDate.startOf("month").diff(now.clone().startOf("month"), "months")
			if (monthDiff < 0 || monthDiff >= 12) {
				continue
			}

			const monthKey = couponDate.format("YYYY-MM")
			const couponAmountRub = convertToRub((coupon.payout ?? 0) * qty, bondCurrency, rates) ?? 0
			scheduleByMonth.set(monthKey, roundTo((scheduleByMonth.get(monthKey) ?? 0) + couponAmountRub) ?? 0)
		}
	}

	const normalizedPurchaseCostRub = roundTo(purchaseCostRub) ?? 0
	const normalizedCouponProfitRub = roundTo(couponProfitRub) ?? 0
	const normalizedMaturityProfitRub = roundTo(maturityProfitRub) ?? 0
	const maturityProfitPct = normalizedPurchaseCostRub > 0
		? roundTo((normalizedMaturityProfitRub / normalizedPurchaseCostRub) * 100) ?? 0
		: 0

	return {
		baseCurrency: "RUB",
		totals: {
			totalBonds,
			totalCoupons,
			purchaseCostRub: normalizedPurchaseCostRub,
			couponProfitRub: normalizedCouponProfitRub,
			maturityProfitRub: normalizedMaturityProfitRub,
			maturityProfitPct,
		},
		couponSchedule: buildCouponSchedule(scheduleByMonth, now),
		sectorAllocation: buildSectorAllocation(sectorAmounts),
		actuality: {
			bondsUpdatedAt: bondsStatus.lastBuildCompletedAt,
			ratesUpdatedAt: rates.updatedAt,
			ratesDate: rates.rateDate,
			generatedAt: now.toISOString(),
		},
	}
}

async function resolveCouponSummary(bond: CombinedBondsResponse, now: moment.Moment): Promise<CouponSummary | undefined> {
	if (Array.isArray(bond.coupons) && bond.leftToPay !== undefined && bond.leftCouponCount !== undefined) {
		return {
			coupons: bond.coupons,
			leftToPay: bond.leftToPay,
			leftCouponCount: bond.leftCouponCount,
			annualCouponSum: bond.couponsYield,
		}
	}

	return getCouponSummary(String(bond.figi), Boolean(bond.floatingCouponFlag), now)
}

function buildCouponSchedule(scheduleByMonth: Map<string, number>, now: moment.Moment): PortfolioCouponScheduleItem[] {
	const formatter = new Intl.DateTimeFormat("ru-RU", {
		month: "short",
		year: "numeric",
		timeZone: "UTC",
	})

	return Array.from({ length: 12 }, (_, index) => {
		const month = now.clone().startOf("month").add(index, "months")
		const monthKey = month.format("YYYY-MM")
		return {
			month: monthKey,
			label: formatter.format(month.toDate()),
			amountRub: roundTo(scheduleByMonth.get(monthKey) ?? 0) ?? 0,
		}
	})
}

function buildSectorAllocation(sectorAmounts: Map<string, number>): PortfolioSectorAllocationItem[] {
	const total = Array.from(sectorAmounts.values()).reduce((sum, amount) => sum + amount, 0)

	return Array.from(sectorAmounts.entries())
		.map(([sector, amountRub]) => ({
			sector,
			amountRub: roundTo(amountRub) ?? 0,
			sharePct: total > 0 ? roundTo((amountRub / total) * 100) ?? 0 : 0,
		}))
		.sort((a, b) => b.amountRub - a.amountRub)
}
