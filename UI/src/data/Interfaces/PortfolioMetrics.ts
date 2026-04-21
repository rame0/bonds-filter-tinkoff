export interface PortfolioPositionInput {
	uid: string
	qty: number
}

export interface PortfolioTotals {
	totalBonds: number
	totalCoupons: number
	purchaseCostRub: number
	couponProfitRub: number
	maturityValueRub: number
	maturityValuePct: number
}

export interface PortfolioCouponScheduleItem {
	month: string
	label: string
	amountRub: number
}

export interface PortfolioSectorAllocationItem {
	sector: string
	amountRub: number
	sharePct: number
}

export interface PortfolioRiskProfileItem {
	riskLevel: number
	label: string
	amountRub: number
	sharePct: number
}

export interface PortfolioRiskProfile {
	summary: string
	items: PortfolioRiskProfileItem[]
}

export interface PortfolioActuality {
	bondsUpdatedAt?: string
	ratesUpdatedAt: string
	ratesDate: string
	generatedAt: string
}

export interface PortfolioMetricsResponse {
	baseCurrency: "RUB"
	totals: PortfolioTotals
	couponSchedule: PortfolioCouponScheduleItem[]
	sectorAllocation: PortfolioSectorAllocationItem[]
	riskProfile: PortfolioRiskProfile
	actuality: PortfolioActuality
}
