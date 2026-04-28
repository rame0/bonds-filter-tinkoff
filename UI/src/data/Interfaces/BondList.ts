import type { CombinedBondsResponse } from "./CombinedBondsResponse"

export type BondListSortOrder = "ascending" | "descending"

export interface BondListQuery {
	page?: number
	pageSize?: number
	sortProp?: string
	sortOrder?: BondListSortOrder
	filters?: Record<string, unknown>
}

export interface BondListResponse {
	items: CombinedBondsResponse[]
	total: number
	page: number
	pageSize: number
}

export interface BondFilterOptionsResponse {
	classCode: number[]
	currency: string[]
	couponQuantityPerYear: number[]
	countryOfRisk: string[]
	sector: string[]
	issueKind: string[]
	realExchange: string[]
	riskLevel: number[]
	liquidity: number[]
}
