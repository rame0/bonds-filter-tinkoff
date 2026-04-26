import moment from "moment"
import { BondFilterOptionsResponse, BondListQuery, BondListResponse } from "./interfaces/BondList"
import { CombinedBondsResponse } from "./interfaces/CombinedBondsResponse"

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 20
const RANGE_FILTER_KEYS = new Set(["nominal", "placementPrice", "price", "yield", "bondYield", "duration"])
const DYNAMIC_FILTER_KEYS = ["classCode", "currency", "couponQuantityPerYear", "countryOfRisk"] as const

interface RangeFilter {
	from: number
	to: number
}

export function listBondsData(bonds: CombinedBondsResponse[], query: BondListQuery = {}): BondListResponse {
	const page = normalizePage(query.page)
	const pageSize = normalizePageSize(query.pageSize)
	const filtered = bonds.filter(bond => matchesBondFilters(bond, query.filters ?? {}))
	const sorted = [...filtered].sort((left, right) => compareBonds(left, right, query.sortProp, query.sortOrder ?? "ascending"))
	const start = (page - 1) * pageSize

	return {
		items: sorted.slice(start, start + pageSize),
		total: filtered.length,
		page,
		pageSize,
	}
}

export function getBondFilterOptions(bonds: CombinedBondsResponse[]): BondFilterOptionsResponse {
	return {
		classCode: getUniqueOptionValues(bonds, "classCode") as number[],
		currency: getUniqueOptionValues(bonds, "currency") as string[],
		couponQuantityPerYear: getUniqueOptionValues(bonds, "couponQuantityPerYear") as number[],
		countryOfRisk: getUniqueOptionValues(bonds, "countryOfRisk") as string[],
	}
}

function matchesBondFilters(bond: CombinedBondsResponse, filters: Record<string, unknown>) {
	for (const [key, value] of Object.entries(filters)) {
		if (!isAppliedFilter(key, value)) {
			continue
		}

		if (key === "search") {
			if (!matchesSearch(bond, String(value))) {
				return false
			}
			continue
		}

		if (key === "couponMonths") {
			if (!matchesCouponMonths(bond, value, filters.couponMonthsMatchMode)) {
				return false
			}
			continue
		}

		const bondValue = bond[key as keyof CombinedBondsResponse]

		if (RANGE_FILTER_KEYS.has(key)) {
			if (!matchesRange(bondValue, value)) {
				return false
			}
			continue
		}

		if (Array.isArray(value)) {
			if (!matchesArrayValue(bondValue, value)) {
				return false
			}
			continue
		}

		if (value !== -1 && value !== bondValue) {
			return false
		}
	}

	return true
}

function isAppliedFilter(key: string, value: unknown) {
	if (key === "couponMonthsMatchMode" || value === undefined) {
		return false
	}

	if (Array.isArray(value)) {
		return value.length > 0
	}

	if (isRangeFilter(value)) {
		return true
	}

	if (typeof value === "string") {
		return value !== ""
	}

	return typeof value === "number" ? value >= 0 : true
}

function matchesSearch(bond: CombinedBondsResponse, search: string) {
	const needle = search.toLowerCase()
	return [bond.name, bond.ticker, bond.figi, bond.isin]
		.some(value => String(value ?? "").toLowerCase().includes(needle))
}

function matchesCouponMonths(bond: CombinedBondsResponse, selectedValue: unknown, matchMode: unknown) {
	if (!Array.isArray(selectedValue) || selectedValue.length < 1) {
		return true
	}

	const knownCouponMonths = getKnownCouponMonths(bond.coupons)
	if (knownCouponMonths.length < 1) {
		return false
	}

	const selectedMonths = selectedValue.map(value => Number(value)).filter(Number.isInteger)
	if (selectedMonths.length < 1) {
		return true
	}

	return matchMode === "all"
		? selectedMonths.every(month => knownCouponMonths.includes(month))
		: selectedMonths.some(month => knownCouponMonths.includes(month))
}

function getKnownCouponMonths(coupons = []) {
	return [...new Set(coupons.flatMap(coupon => {
		const couponDate = moment(coupon.couponDate)
		return couponDate.isValid() ? [couponDate.month()] : []
	}))]
}

function matchesRange(bondValue: unknown, rangeValue: unknown) {
	if (!isRangeFilter(rangeValue) || typeof bondValue !== "number") {
		return true
	}

	return !(bondValue < rangeValue.from || bondValue > rangeValue.to)
}

function matchesArrayValue(bondValue: unknown, selectedValues: unknown[]) {
	return selectedValues.includes(Number(bondValue ?? 0)) || selectedValues.includes(String(bondValue))
}

function compareBonds(
	left: CombinedBondsResponse,
	right: CombinedBondsResponse,
	sortProp = "name",
	order: "ascending" | "descending",
) {
	const leftValue = left[sortProp as keyof CombinedBondsResponse]
	const rightValue = right[sortProp as keyof CombinedBondsResponse]

	if (leftValue === undefined) {
		return 1
	}

	if (rightValue === undefined) {
		return -1
	}

	if (leftValue > rightValue) {
		return order === "ascending" ? 1 : -1
	}

	if (leftValue < rightValue) {
		return order === "ascending" ? -1 : 1
	}

	return 0
}

function getUniqueOptionValues(
	bonds: CombinedBondsResponse[],
	key: (typeof DYNAMIC_FILTER_KEYS)[number],
) {
	return [...new Set(
		bonds
			.map(bond => bond[key])
			.filter(value => value !== null && value !== undefined && value !== ""),
	)]
		.sort((left, right) => left > right ? 1 : left < right ? -1 : 0)
}

function normalizePage(value?: number) {
	if (!Number.isFinite(value) || !value || value < 1) {
		return DEFAULT_PAGE
	}

	return Math.floor(value)
}

function normalizePageSize(value?: number) {
	if (!Number.isFinite(value) || !value || value < 1) {
		return DEFAULT_PAGE_SIZE
	}

	return Math.min(500, Math.floor(value))
}

function isRangeFilter(value: unknown): value is RangeFilter {
	return typeof value === "object"
		&& value !== null
		&& "from" in value
		&& "to" in value
		&& typeof value.from === "number"
		&& typeof value.to === "number"
}
