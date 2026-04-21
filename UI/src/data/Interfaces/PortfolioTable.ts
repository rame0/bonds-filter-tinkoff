export interface PortfolioCouponTooltipGroup {
	count: number
	amount: number
	currency: string
}

export interface PortfolioCouponTooltip {
	groups: PortfolioCouponTooltipGroup[]
	isEstimated: boolean
	isFloating: boolean
	isAmortizing: boolean
}

export interface PortfolioTableRow {
	uid: string
	name: string
	ticker: string
	qty: number
	currency: string
	displayDate?: string
	pricePct?: number
	nominal?: number
	aciValue?: number
	fullPrice?: number
	positionCost?: number
	bondYield?: number
	couponCountLeft: number
	couponTooltip: PortfolioCouponTooltip
	couponMonths: boolean[]
	sector: string
	riskLevel: number
	liquidity?: number
}

export interface PortfolioTableResponse {
	rows: PortfolioTableRow[]
}
