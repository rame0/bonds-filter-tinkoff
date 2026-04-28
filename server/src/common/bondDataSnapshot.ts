import { BondFilterOptionsResponse, BondListQuery, BondListResponse } from "./interfaces/BondList"
import { type CombinedBondsResponse } from "./interfaces/CombinedBondsResponse"
import { type CombinedCoupon } from "./interfaces/CombinedCoupon"
import { getDatabase } from "./sqlite"

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 20
const SORT_COLUMN_BY_PROP: Record<string, string> = {
	name: "bi.name",
	ticker: "bi.ticker",
	nominal: "bi.nominal",
	price: "bms.price_percent",
	bondYield: "COALESCE(bdm.bond_yield_percent_final, bms.bond_yield_percent)",
	duration: "COALESCE(bdm.duration_months_final, bms.duration_months)",
	couponsYield: "COALESCE(bdm.coupons_yield_rub_12m, bca.annual_coupon_sum_rub)",
	liquidity: "bls.liquidity",
}

interface BondListItemRow {
	uid: string
	figi: string
	ticker: string
	isin: string | null
	name: string
	currency: string | null
	classCode: string | null
	couponQuantityPerYear: number | null
	countryOfRisk: string | null
	nominal: number | null
	aciValue: number | null
	price: number | null
	bondYield: number | null
	duration: number | null
	liquidity: number | null
	couponsYield: number | null
	leftCouponCount: number | null
	sector: string | null
	riskLevel: number | null
	buyBackDate: string | null
	maturityDate: string | null
	floatingCouponFlag: number
	amortizationFlag: number
	perpetualFlag: number
	couponProjectionQuality: string | null
	bondYieldSource: string | null
	durationSource: string | null
	couponsYieldSource: string | null
	liquiditySource: string | null
}

interface BondEventRow {
	uid: string
	eventDate: string
	couponNumber: number | null
	couponValueNative: number | null
	isEstimated: number
}

interface DerivedMetricInputRow {
	uid: string
	currency: string | null
	nominal: number | null
	aciValue: number | null
	pricePercent: number | null
	priceSource: string | null
	bondYieldPercent: number | null
	bondYieldSource: string | null
	durationMonths: number | null
	durationSource: string | null
	annualCouponSumRub: number | null
	leftCouponCount: number | null
	leftToPayRub: number | null
	aggregateSource: string | null
	buyBackDate: string | null
	maturityDate: string | null
	derivedDirtyReason: string | null
	needsRecompute: number | null
}

const db = getDatabase()

export function getStoredBondCount() {
	const row = db.query<{ total: number }>("SELECT COUNT(*) AS total FROM bond_instruments").get()
	return Number(row?.total ?? 0)
}

export function loadStoredBonds(): CombinedBondsResponse[] {
	const rows = readBondListRows("", {}, "bi.name ASC", "")
	const couponsByUid = loadCouponsByUid()

	return rows.map(row => {
		const coupons = couponsByUid.get(row.uid) ?? []
		const leftToPay = coupons.reduce((sum, coupon) => sum + (coupon.payout ?? 0), 0)

		return {
			uid: row.uid,
			figi: row.figi,
			ticker: row.ticker,
			isin: row.isin ?? undefined,
			name: row.name,
			currency: row.currency ?? undefined,
			classCode: row.classCode ?? undefined,
			couponQuantityPerYear: row.couponQuantityPerYear ?? undefined,
			countryOfRisk: row.countryOfRisk ?? undefined,
			nominal: row.nominal ?? undefined,
			aciValue: row.aciValue ?? undefined,
			price: row.price ?? undefined,
			bondYield: row.bondYield ?? undefined,
			duration: row.duration ?? undefined,
			liquidity: row.liquidity ?? undefined,
			couponsYield: row.couponsYield ?? undefined,
			leftCouponCount: row.leftCouponCount ?? coupons.length,
			leftToPay,
			sector: row.sector ?? undefined,
			riskLevel: row.riskLevel ?? undefined,
			buyBackDate: row.buyBackDate ? new Date(row.buyBackDate) : undefined,
			maturityDate: row.maturityDate ? new Date(row.maturityDate) : undefined,
			floatingCouponFlag: Boolean(row.floatingCouponFlag),
			amortizationFlag: Boolean(row.amortizationFlag),
			perpetualFlag: Boolean(row.perpetualFlag),
			couponProjectionQuality: row.couponProjectionQuality ?? undefined,
			bondYieldSource: row.bondYieldSource ?? undefined,
			durationSource: row.durationSource ?? undefined,
			couponsYieldSource: row.couponsYieldSource ?? undefined,
			liquiditySource: row.liquiditySource ?? undefined,
			coupons,
			qty: 0,
		}
	})
}

export function listStoredBondsData(query: BondListQuery = {}): BondListResponse {
	const page = normalizePage(query.page)
	const pageSize = normalizePageSize(query.pageSize)
	const params: Record<string, unknown> = {}
	const whereClause = buildWhereClause(query.filters ?? {}, params)
	const orderBy = buildOrderBy(query.sortProp, query.sortOrder)
	const countRow = db.query<{ total: number }, [Record<string, unknown>]>(`
		SELECT COUNT(*) AS total
		FROM bond_instruments bi
		LEFT JOIN bond_market_snapshot bms ON bms.uid = bi.uid
		LEFT JOIN bond_liquidity_snapshot bls ON bls.uid = bi.uid
		LEFT JOIN bond_coupon_aggregates bca ON bca.uid = bi.uid
		LEFT JOIN bond_derived_metrics bdm ON bdm.uid = bi.uid
		${whereClause}
	`).get(params as never)
	params.$limit = pageSize
	params.$offset = (page - 1) * pageSize

	return {
		items: readBondListRows(whereClause, params, orderBy, "LIMIT $limit OFFSET $offset").map(mapBondListRow),
		total: Number(countRow?.total ?? 0),
		page,
		pageSize,
	}
}

export function getStoredBondFilterOptions(): BondFilterOptionsResponse {
	return {
		classCode: readDistinctNumberValues("class_code"),
		currency: readDistinctStringValues("currency"),
		couponQuantityPerYear: readDistinctNumberValues("coupon_quantity_per_year"),
		countryOfRisk: readDistinctStringValues("country_of_risk"),
	}
}

export function listDerivedMetricInputs(onlyDirty = true) {
	const whereClause = onlyDirty ? "WHERE COALESCE(bss.needs_recompute, 1) = 1" : ""
	return db.query<DerivedMetricInputRow>(`
		SELECT
			bi.uid,
			bi.currency,
			bi.nominal,
			bi.aci_value AS aciValue,
			bms.price_percent AS pricePercent,
			bms.price_source AS priceSource,
			bms.bond_yield_percent AS bondYieldPercent,
			bms.bond_yield_source AS bondYieldSource,
			bms.duration_months AS durationMonths,
			bms.duration_source AS durationSource,
			bca.annual_coupon_sum_rub AS annualCouponSumRub,
			bca.left_coupon_count AS leftCouponCount,
			bca.left_to_pay_rub AS leftToPayRub,
			bca.aggregate_source AS aggregateSource,
			bi.buyback_date AS buyBackDate,
			bi.maturity_date AS maturityDate,
			bdm.dirty_reason AS derivedDirtyReason,
			bss.needs_recompute AS needsRecompute
		FROM bond_instruments bi
		LEFT JOIN bond_market_snapshot bms ON bms.uid = bi.uid
		LEFT JOIN bond_coupon_aggregates bca ON bca.uid = bi.uid
		LEFT JOIN bond_derived_metrics bdm ON bdm.uid = bi.uid
		LEFT JOIN bond_sync_state bss ON bss.uid = bi.uid
		${whereClause}
	`).all().map(row => ({
		...row,
		currency: row.currency ?? undefined,
		nominal: row.nominal ?? undefined,
		aciValue: row.aciValue ?? undefined,
		pricePercent: row.pricePercent ?? undefined,
		priceSource: row.priceSource ?? undefined,
		bondYieldPercent: row.bondYieldPercent ?? undefined,
		bondYieldSource: row.bondYieldSource ?? undefined,
		durationMonths: row.durationMonths ?? undefined,
		durationSource: row.durationSource ?? undefined,
		annualCouponSumRub: row.annualCouponSumRub ?? undefined,
		leftCouponCount: row.leftCouponCount ?? undefined,
		leftToPayRub: row.leftToPayRub ?? undefined,
		aggregateSource: row.aggregateSource ?? undefined,
		buyBackDate: row.buyBackDate ?? undefined,
		maturityDate: row.maturityDate ?? undefined,
		derivedDirtyReason: row.derivedDirtyReason ?? undefined,
		needsRecompute: row.needsRecompute ?? undefined,
	}))
}

function readBondListRows(whereClause: string, params: Record<string, unknown>, orderBy: string, paginationClause: string) {
	return db.query<BondListItemRow, [Record<string, unknown>]>(`
		SELECT
			bi.uid,
			bi.figi,
			bi.ticker,
			bi.isin,
			bi.name,
			bi.currency,
			bi.class_code AS classCode,
			bi.coupon_quantity_per_year AS couponQuantityPerYear,
			bi.country_of_risk AS countryOfRisk,
			bi.nominal,
			bi.aci_value AS aciValue,
			bms.price_percent AS price,
			COALESCE(bdm.bond_yield_percent_final, bms.bond_yield_percent) AS bondYield,
			COALESCE(bdm.duration_months_final, bms.duration_months) AS duration,
			bls.liquidity,
			COALESCE(bdm.coupons_yield_rub_12m, bca.annual_coupon_sum_rub) AS couponsYield,
			COALESCE(bdm.left_coupon_count, bca.left_coupon_count) AS leftCouponCount,
			bi.sector,
			bi.risk_level AS riskLevel,
			bi.buyback_date AS buyBackDate,
			bi.maturity_date AS maturityDate,
			bi.floating_coupon_flag AS floatingCouponFlag,
			bi.amortization_flag AS amortizationFlag,
			bi.perpetual_flag AS perpetualFlag,
			bca.coupon_projection_quality AS couponProjectionQuality,
			COALESCE(bdm.bond_yield_final_source, bms.bond_yield_source) AS bondYieldSource,
			COALESCE(bdm.duration_final_source, bms.duration_source) AS durationSource,
			COALESCE(bdm.coupons_yield_source, bca.aggregate_source) AS couponsYieldSource,
			bls.liquidity_source AS liquiditySource
		FROM bond_instruments bi
		LEFT JOIN bond_market_snapshot bms ON bms.uid = bi.uid
		LEFT JOIN bond_liquidity_snapshot bls ON bls.uid = bi.uid
		LEFT JOIN bond_coupon_aggregates bca ON bca.uid = bi.uid
		LEFT JOIN bond_derived_metrics bdm ON bdm.uid = bi.uid
		${whereClause}
		ORDER BY ${orderBy}
		${paginationClause}
	`).all(params as never)
}

function loadCouponsByUid() {
	const rows = db.query<BondEventRow>(`
		SELECT uid, event_date AS eventDate, coupon_number AS couponNumber, coupon_value_native AS couponValueNative, is_estimated AS isEstimated
		FROM bond_coupon_events
		ORDER BY uid ASC, event_date ASC
	`).all()
	const couponsByUid = new Map<string, CombinedCoupon[]>()

	for (const row of rows) {
		const coupons = couponsByUid.get(row.uid) ?? []
		coupons.push({
			couponDate: row.eventDate,
			couponNumber: row.couponNumber ?? 0,
			payout: row.couponValueNative ?? undefined,
			isEstimated: Boolean(row.isEstimated),
		})
		couponsByUid.set(row.uid, coupons)
	}

	return couponsByUid
}

function mapBondListRow(row: BondListItemRow): CombinedBondsResponse {
	return {
		uid: row.uid,
		figi: row.figi,
		ticker: row.ticker,
		isin: row.isin ?? undefined,
		name: row.name,
		currency: row.currency ?? undefined,
		classCode: row.classCode ?? undefined,
		couponQuantityPerYear: row.couponQuantityPerYear ?? undefined,
		countryOfRisk: row.countryOfRisk ?? undefined,
		nominal: row.nominal ?? undefined,
		aciValue: row.aciValue ?? undefined,
		price: row.price ?? undefined,
		bondYield: row.bondYield ?? undefined,
		duration: row.duration ?? undefined,
		liquidity: row.liquidity ?? undefined,
		couponsYield: row.couponsYield ?? undefined,
		leftCouponCount: row.leftCouponCount ?? undefined,
		sector: row.sector ?? undefined,
		riskLevel: row.riskLevel ?? undefined,
		buyBackDate: row.buyBackDate ? new Date(row.buyBackDate) : undefined,
		maturityDate: row.maturityDate ? new Date(row.maturityDate) : undefined,
		floatingCouponFlag: Boolean(row.floatingCouponFlag),
		amortizationFlag: Boolean(row.amortizationFlag),
		perpetualFlag: Boolean(row.perpetualFlag),
		couponProjectionQuality: row.couponProjectionQuality ?? undefined,
		bondYieldSource: row.bondYieldSource ?? undefined,
		durationSource: row.durationSource ?? undefined,
		couponsYieldSource: row.couponsYieldSource ?? undefined,
		liquiditySource: row.liquiditySource ?? undefined,
		qty: 0,
	}
}

function buildWhereClause(filters: Record<string, unknown>, params: Record<string, unknown>) {
	const conditions: string[] = []

	for (const [key, value] of Object.entries(filters)) {
		if (!isAppliedFilter(key, value)) {
			continue
		}

		if (key === "search") {
			const search = String(value).trim()
			params.$searchLower = `%${search.toLowerCase()}%`
			params.$searchUpper = `%${search.toUpperCase()}%`
			params.$searchTitle = `%${toTitleCase(search)}%`
			params.$searchRaw = `%${search}%`
			conditions.push([
				"(",
				"bi.name LIKE $searchRaw",
				"OR bi.name LIKE $searchTitle",
				"OR bi.name LIKE $searchUpper",
				"OR bi.name LIKE $searchLower",
				"OR LOWER(bi.ticker) LIKE $searchLower",
				"OR LOWER(bi.figi) LIKE $searchLower",
				"OR LOWER(COALESCE(bi.isin, '')) LIKE $searchLower",
				")",
			].join(" "))
			continue
		}

		if (key === "couponMonths") {
			pushCouponMonthsCondition(conditions, params, value, filters.couponMonthsMatchMode)
			continue
		}

		if (key === "currency" || key === "classCode" || key === "couponQuantityPerYear" || key === "countryOfRisk") {
			pushArrayCondition(conditions, params, key, value)
			continue
		}

		if (key === "nominal" || key === "price" || key === "bondYield" || key === "duration") {
			pushRangeCondition(conditions, params, key, value)
		}
	}

	return conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""
}

function pushArrayCondition(conditions: string[], params: Record<string, unknown>, key: string, value: unknown) {
	if (!Array.isArray(value) || value.length < 1) {
		return
	}

	const columnByKey: Record<string, string> = {
		classCode: "bi.class_code",
		currency: "bi.currency",
		couponQuantityPerYear: "bi.coupon_quantity_per_year",
		countryOfRisk: "bi.country_of_risk",
	}
	const placeholders = value.map((item, index) => {
		const paramName = `$${key}${index}`
		params[paramName] = item
		return paramName
	})
	conditions.push(`${columnByKey[key]} IN (${placeholders.join(", ")})`)
}

function pushRangeCondition(conditions: string[], params: Record<string, unknown>, key: string, value: unknown) {
	if (!isRangeFilter(value)) {
		return
	}

	const columnByKey: Record<string, string> = {
		nominal: "bi.nominal",
		price: "bms.price_percent",
		bondYield: "COALESCE(bdm.bond_yield_percent_final, bms.bond_yield_percent)",
		duration: "COALESCE(bdm.duration_months_final, bms.duration_months)",
	}
	params[`$${key}From`] = value.from
	params[`$${key}To`] = value.to
	conditions.push(`${columnByKey[key]} BETWEEN $${key}From AND $${key}To`)
}

function pushCouponMonthsCondition(
	conditions: string[],
	params: Record<string, unknown>,
	value: unknown,
	matchMode: unknown,
) {
	if (!Array.isArray(value) || value.length < 1) {
		return
	}

	const selectedMonths = value.map(item => Number(item)).filter(month => Number.isInteger(month))
	if (selectedMonths.length < 1) {
		return
	}

	const placeholders = selectedMonths.map((month, index) => {
		const paramName = `$couponMonth${index}`
		params[paramName] = month
		return paramName
	})
	const inClause = placeholders.join(", ")

	if (matchMode === "all") {
		params.$couponMonthCount = selectedMonths.length
		conditions.push(`(
			SELECT COUNT(DISTINCT bcm.month_index)
			FROM bond_coupon_months bcm
			WHERE bcm.uid = bi.uid AND bcm.month_index IN (${inClause})
		) = $couponMonthCount`)
		return
	}

	conditions.push(`EXISTS (
		SELECT 1
		FROM bond_coupon_months bcm
		WHERE bcm.uid = bi.uid AND bcm.month_index IN (${inClause})
	)`)
}

function readDistinctStringValues(column: string) {
	return readDistinctValues(column).flatMap(value => typeof value === "string" ? [value] : [])
}

function readDistinctNumberValues(column: string) {
	return readDistinctValues(column).flatMap(value => {
		const normalized = Number(value)
		return Number.isFinite(normalized) ? [normalized] : []
	})
}

function readDistinctValues(column: string) {
	return db.query<{ value: string | number | null }>(`
		SELECT DISTINCT ${column} AS value
		FROM bond_instruments
		WHERE ${column} IS NOT NULL AND ${column} != ''
		ORDER BY value ASC
	`).all().flatMap(row => row.value === null ? [] : [row.value])
}

function buildOrderBy(sortProp: string | undefined, sortOrder: string | undefined) {
	const column = SORT_COLUMN_BY_PROP[sortProp ?? ""] ?? SORT_COLUMN_BY_PROP.name
	const direction = sortOrder === "descending" ? "DESC" : "ASC"
	return `${column} ${direction}, bi.name ASC`
}

function normalizePage(value?: number) {
	if (!Number.isFinite(value) || !value || value < 1) {
		return DEFAULT_PAGE
	}

	return Math.floor(value)
}

function toTitleCase(value: string) {
	if (value.length < 1) {
		return value
	}

	return value[0].toUpperCase() + value.slice(1).toLowerCase()
}

function normalizePageSize(value?: number) {
	if (!Number.isFinite(value) || !value || value < 1) {
		return DEFAULT_PAGE_SIZE
	}

	return Math.min(500, Math.floor(value))
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

function isRangeFilter(value: unknown): value is { from: number, to: number } {
	return typeof value === "object"
		&& value !== null
		&& "from" in value
		&& "to" in value
		&& typeof value.from === "number"
		&& typeof value.to === "number"
}
