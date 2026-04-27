import { getDatabase } from "./sqlite"

export interface BondInstrumentRecord {
	uid: string
	figi: string
	ticker: string
	isin?: string
	name: string
	currency?: string
	nominal?: number
	aciValue?: number
	countryOfRisk?: string
	sector?: string
	issueKind?: string
	realExchange?: string
	riskLevel?: number
	couponQuantityPerYear?: number
	floatingCouponFlag: boolean
	amortizationFlag: boolean
	perpetualFlag: boolean
	subordinatedFlag: boolean
	buyAvailableFlag: boolean
	sellAvailableFlag: boolean
	apiTradeAvailableFlag: boolean
	forIisFlag: boolean
	forQualInvestorFlag: boolean
	otcFlag: boolean
	weekendFlag: boolean
	buyBackDate?: string
	maturityDate?: string
	classCode?: string
	sourceUpdatedAt: string
	updatedAt: string
}

export interface BondInstrumentSyncRef {
	uid: string
	figi: string
	ticker: string
	currency?: string
	nominal?: number
	aciValue?: number
	floatingCouponFlag: boolean
	amortizationFlag: boolean
	perpetualFlag: boolean
	buyBackDate?: string
	maturityDate?: string
	boardId?: string
}

export interface BondMarketSnapshotRecord {
	uid: string
	pricePercent?: number
	priceSource?: string
	bondYieldPercent?: number
	bondYieldSource?: string
	durationMonths?: number
	durationSource?: string
	marketCurrency?: string
	moexBoardId?: string
	sourceUpdatedAt: string
	updatedAt: string
}

export interface BondLiquiditySnapshotRecord {
	uid: string
	liquidity?: number
	tradeDays?: number
	volumeSum?: number
	windowFrom?: string
	windowTo?: string
	liquiditySource?: string
	updatedAt: string
}

export interface BondCouponEventRecord {
	eventKey: string
	uid: string
	couponNumber?: number
	eventDate: string
	eventType: string
	couponValueNative?: number
	couponCurrency?: string
	couponValueRub?: number
	couponPercent?: number
	principalPaymentNative?: number
	principalPaymentCurrency?: string
	principalPaymentRub?: number
	remainingPrincipalNative?: number
	remainingPrincipalCurrency?: string
	isFloating: boolean
	isAmortizing: boolean
	isPerpetual: boolean
	isKnown: boolean
	isEstimated: boolean
	estimationMethod?: string
	source: string
	sourcePriority: number
	rawFingerprint?: string
	updatedAt: string
}

export interface BondCouponAggregateRecord {
	uid: string
	annualCouponSumRub?: number
	leftToPayRub?: number
	leftCouponCount: number
	nextCouponDate?: string
	nextCouponValueRub?: number
	couponProjectionQuality: string
	hasEstimatedFutureCoupons: boolean
	hasAmortization: boolean
	hasFloatingCoupons: boolean
	aggregateSource?: string
	computedAt: string
}

export interface BondDerivedMetricsRecord {
	uid: string
	realPriceRub?: number
	couponsYieldRub12m?: number
	couponsYieldSource?: string
	bondYieldPercentFinal?: number
	bondYieldFinalSource?: string
	durationMonthsFinal?: number
	durationFinalSource?: string
	leftCouponCount?: number
	leftToPayRub?: number
	dirtyReason?: string
	computedAt: string
}

interface BondListQueryRow {
	uid: string
	figi: string
	ticker: string
	currency: string | null
	nominal: number | null
	aciValue: number | null
	floatingCouponFlag: number
	amortizationFlag: number
	perpetualFlag: number
	buyBackDate: string | null
	maturityDate: string | null
	boardId: string | null
}

const db = getDatabase()

export function upsertBondInstrument(record: BondInstrumentRecord) {
	db.run(`
		INSERT INTO bond_instruments (
			uid, figi, ticker, isin, name, currency, nominal, aci_value, country_of_risk, sector,
			issue_kind, real_exchange, risk_level, coupon_quantity_per_year,
			floating_coupon_flag, amortization_flag, perpetual_flag, subordinated_flag,
			buy_available_flag, sell_available_flag, api_trade_available_flag, for_iis_flag,
			for_qual_investor_flag, otc_flag, weekend_flag, buyback_date, maturity_date,
			class_code, source_updated_at, updated_at
		) VALUES (
			$uid, $figi, $ticker, $isin, $name, $currency, $nominal, $aciValue, $countryOfRisk, $sector,
			$issueKind, $realExchange, $riskLevel, $couponQuantityPerYear,
			$floatingCouponFlag, $amortizationFlag, $perpetualFlag, $subordinatedFlag,
			$buyAvailableFlag, $sellAvailableFlag, $apiTradeAvailableFlag, $forIisFlag,
			$forQualInvestorFlag, $otcFlag, $weekendFlag, $buyBackDate, $maturityDate,
			$classCode, $sourceUpdatedAt, $updatedAt
		)
		ON CONFLICT(uid) DO UPDATE SET
			figi = excluded.figi,
			ticker = excluded.ticker,
			isin = excluded.isin,
			name = excluded.name,
			currency = excluded.currency,
			nominal = excluded.nominal,
			aci_value = excluded.aci_value,
			country_of_risk = excluded.country_of_risk,
			sector = excluded.sector,
			issue_kind = excluded.issue_kind,
			real_exchange = excluded.real_exchange,
			risk_level = excluded.risk_level,
			coupon_quantity_per_year = excluded.coupon_quantity_per_year,
			floating_coupon_flag = excluded.floating_coupon_flag,
			amortization_flag = excluded.amortization_flag,
			perpetual_flag = excluded.perpetual_flag,
			subordinated_flag = excluded.subordinated_flag,
			buy_available_flag = excluded.buy_available_flag,
			sell_available_flag = excluded.sell_available_flag,
			api_trade_available_flag = excluded.api_trade_available_flag,
			for_iis_flag = excluded.for_iis_flag,
			for_qual_investor_flag = excluded.for_qual_investor_flag,
			otc_flag = excluded.otc_flag,
			weekend_flag = excluded.weekend_flag,
			buyback_date = excluded.buyback_date,
			maturity_date = excluded.maturity_date,
			class_code = excluded.class_code,
			source_updated_at = excluded.source_updated_at,
			updated_at = excluded.updated_at
	`, toSqliteParams(record))
}

export function upsertBondMarketSnapshot(record: BondMarketSnapshotRecord) {
	db.run(`
		INSERT INTO bond_market_snapshot (
			uid, price_percent, price_source, bond_yield_percent, bond_yield_source,
			duration_months, duration_source, market_currency, moex_board_id, source_updated_at, updated_at
		) VALUES (
			$uid, $pricePercent, $priceSource, $bondYieldPercent, $bondYieldSource,
			$durationMonths, $durationSource, $marketCurrency, $moexBoardId, $sourceUpdatedAt, $updatedAt
		)
		ON CONFLICT(uid) DO UPDATE SET
			price_percent = excluded.price_percent,
			price_source = excluded.price_source,
			bond_yield_percent = excluded.bond_yield_percent,
			bond_yield_source = excluded.bond_yield_source,
			duration_months = excluded.duration_months,
			duration_source = excluded.duration_source,
			market_currency = excluded.market_currency,
			moex_board_id = excluded.moex_board_id,
			source_updated_at = excluded.source_updated_at,
			updated_at = excluded.updated_at
	`, toSqliteParams(record))
}

export function upsertBondLiquiditySnapshot(record: BondLiquiditySnapshotRecord) {
	db.run(`
		INSERT INTO bond_liquidity_snapshot (
			uid, liquidity, trade_days, volume_sum, window_from, window_to, liquidity_source, updated_at
		) VALUES (
			$uid, $liquidity, $tradeDays, $volumeSum, $windowFrom, $windowTo, $liquiditySource, $updatedAt
		)
		ON CONFLICT(uid) DO UPDATE SET
			liquidity = excluded.liquidity,
			trade_days = excluded.trade_days,
			volume_sum = excluded.volume_sum,
			window_from = excluded.window_from,
			window_to = excluded.window_to,
			liquidity_source = excluded.liquidity_source,
			updated_at = excluded.updated_at
	`, toSqliteParams(record))
}

export function replaceBondCouponEvents(uid: string, events: BondCouponEventRecord[]) {
	db.run("DELETE FROM bond_coupon_events WHERE uid = $uid", { $uid: uid })
	db.run("DELETE FROM bond_coupon_months WHERE uid = $uid", { $uid: uid })

	for (const event of events) {
		db.run(`
			INSERT INTO bond_coupon_events (
				event_key, uid, coupon_number, event_date, event_type, coupon_value_native, coupon_currency,
				coupon_value_rub, coupon_percent, principal_payment_native, principal_payment_currency,
				principal_payment_rub, remaining_principal_native, remaining_principal_currency,
				is_floating, is_amortizing, is_perpetual, is_known, is_estimated,
				estimation_method, source, source_priority, raw_fingerprint, updated_at
			) VALUES (
				$eventKey, $uid, $couponNumber, $eventDate, $eventType, $couponValueNative, $couponCurrency,
				$couponValueRub, $couponPercent, $principalPaymentNative, $principalPaymentCurrency,
				$principalPaymentRub, $remainingPrincipalNative, $remainingPrincipalCurrency,
				$isFloating, $isAmortizing, $isPerpetual, $isKnown, $isEstimated,
				$estimationMethod, $source, $sourcePriority, $rawFingerprint, $updatedAt
			)
		`, toSqliteParams(event))
	}

	const seenMonths = new Set<number>()
	for (const event of events) {
		const eventDate = new Date(event.eventDate)
		if (Number.isNaN(eventDate.valueOf())) {
			continue
		}

		const monthIndex = eventDate.getUTCMonth()
		if (seenMonths.has(monthIndex)) {
			continue
		}

		seenMonths.add(monthIndex)
		db.run(
			"INSERT INTO bond_coupon_months (uid, month_index) VALUES ($uid, $monthIndex)",
			{ $uid: uid, $monthIndex: monthIndex },
		)
	}
}

export function upsertBondCouponAggregates(record: BondCouponAggregateRecord) {
	db.run(`
		INSERT INTO bond_coupon_aggregates (
			uid, annual_coupon_sum_rub, left_to_pay_rub, left_coupon_count, next_coupon_date,
			next_coupon_value_rub, coupon_projection_quality, has_estimated_future_coupons,
			has_amortization, has_floating_coupons, aggregate_source, computed_at
		) VALUES (
			$uid, $annualCouponSumRub, $leftToPayRub, $leftCouponCount, $nextCouponDate,
			$nextCouponValueRub, $couponProjectionQuality, $hasEstimatedFutureCoupons,
			$hasAmortization, $hasFloatingCoupons, $aggregateSource, $computedAt
		)
		ON CONFLICT(uid) DO UPDATE SET
			annual_coupon_sum_rub = excluded.annual_coupon_sum_rub,
			left_to_pay_rub = excluded.left_to_pay_rub,
			left_coupon_count = excluded.left_coupon_count,
			next_coupon_date = excluded.next_coupon_date,
			next_coupon_value_rub = excluded.next_coupon_value_rub,
			coupon_projection_quality = excluded.coupon_projection_quality,
			has_estimated_future_coupons = excluded.has_estimated_future_coupons,
			has_amortization = excluded.has_amortization,
			has_floating_coupons = excluded.has_floating_coupons,
			aggregate_source = excluded.aggregate_source,
			computed_at = excluded.computed_at
	`, toSqliteParams(record))
}

export function upsertBondDerivedMetrics(record: BondDerivedMetricsRecord) {
	db.run(`
		INSERT INTO bond_derived_metrics (
			uid, real_price_rub, coupons_yield_rub_12m, coupons_yield_source, bond_yield_percent_final,
			bond_yield_final_source, duration_months_final, duration_final_source, left_coupon_count,
			left_to_pay_rub, dirty_reason, computed_at
		) VALUES (
			$uid, $realPriceRub, $couponsYieldRub12m, $couponsYieldSource, $bondYieldPercentFinal,
			$bondYieldFinalSource, $durationMonthsFinal, $durationFinalSource, $leftCouponCount,
			$leftToPayRub, $dirtyReason, $computedAt
		)
		ON CONFLICT(uid) DO UPDATE SET
			real_price_rub = excluded.real_price_rub,
			coupons_yield_rub_12m = excluded.coupons_yield_rub_12m,
			coupons_yield_source = excluded.coupons_yield_source,
			bond_yield_percent_final = excluded.bond_yield_percent_final,
			bond_yield_final_source = excluded.bond_yield_final_source,
			duration_months_final = excluded.duration_months_final,
			duration_final_source = excluded.duration_final_source,
			left_coupon_count = excluded.left_coupon_count,
			left_to_pay_rub = excluded.left_to_pay_rub,
			dirty_reason = excluded.dirty_reason,
			computed_at = excluded.computed_at
	`, toSqliteParams(record))
}

export function upsertBondSyncState(uid: string, fields: Record<string, unknown>) {
	const columns = ["uid", ...Object.keys(fields)]
	const values = columns.map(column => `$${column}`)
	const updates = Object.keys(fields).map(column => `${toSnakeCase(column)} = excluded.${toSnakeCase(column)}`)
	const sql = [
		`INSERT INTO bond_sync_state (${columns.map(toSnakeCase).join(", ")})`,
		`VALUES (${values.join(", ")})`,
		`ON CONFLICT(uid) DO UPDATE SET ${updates.join(", ")}`,
	].join(" ")

	db.run(sql, toSqliteParams({ uid, ...fields }))
}

export function listBondInstrumentSyncRefs(): BondInstrumentSyncRef[] {
	return db.query<BondListQueryRow>(`
		SELECT
			bi.uid,
			bi.figi,
			bi.ticker,
			bi.currency,
			bi.nominal,
			bi.aci_value AS aciValue,
			bi.floating_coupon_flag AS floatingCouponFlag,
			bi.amortization_flag AS amortizationFlag,
			bi.perpetual_flag AS perpetualFlag,
			bi.buyback_date AS buyBackDate,
			bi.maturity_date AS maturityDate,
			bms.moex_board_id AS boardId
		FROM bond_instruments bi
		LEFT JOIN bond_market_snapshot bms ON bms.uid = bi.uid
	`).all().map(row => ({
		...row,
		currency: row.currency ?? undefined,
		nominal: row.nominal ?? undefined,
		aciValue: row.aciValue ?? undefined,
		floatingCouponFlag: Boolean(row.floatingCouponFlag),
		amortizationFlag: Boolean(row.amortizationFlag),
		perpetualFlag: Boolean(row.perpetualFlag),
		buyBackDate: row.buyBackDate ?? undefined,
		maturityDate: row.maturityDate ?? undefined,
		boardId: row.boardId ?? undefined,
	}))
}

export function listCouponRefreshCandidates(nowIso: string) {
	return listBondInstrumentSyncRefsByPredicate(`
		bond_sync_state.coupon_events_updated_at IS NULL
		OR bond_sync_state.coupon_events_expires_at IS NULL
		OR bond_sync_state.coupon_events_expires_at <= $nowIso
		OR bond_sync_state.needs_coupon_refresh = 1
	`, { $nowIso: nowIso })
}

export function listLiquidityRefreshCandidates(nowIso: string) {
	return listBondInstrumentSyncRefsByPredicate(`
		bond_sync_state.liquidity_snapshot_updated_at IS NULL
		OR bond_sync_state.liquidity_expires_at IS NULL
		OR bond_sync_state.liquidity_expires_at <= $nowIso
		OR bond_sync_state.needs_liquidity_refresh = 1
	`, { $nowIso: nowIso })
}

function listBondInstrumentSyncRefsByPredicate(whereClause: string, params: Record<string, unknown>) {
	return db.query<BondListQueryRow>(`
		SELECT
			bi.uid,
			bi.figi,
			bi.ticker,
			bi.currency,
			bi.nominal,
			bi.aci_value AS aciValue,
			bi.floating_coupon_flag AS floatingCouponFlag,
			bi.amortization_flag AS amortizationFlag,
			bi.perpetual_flag AS perpetualFlag,
			bi.buyback_date AS buyBackDate,
			bi.maturity_date AS maturityDate,
			bms.moex_board_id AS boardId
		FROM bond_instruments bi
		LEFT JOIN bond_market_snapshot bms ON bms.uid = bi.uid
		LEFT JOIN bond_sync_state ON bond_sync_state.uid = bi.uid
		WHERE ${whereClause}
	`).all(params as never).map(row => ({
		...row,
		currency: row.currency ?? undefined,
		nominal: row.nominal ?? undefined,
		aciValue: row.aciValue ?? undefined,
		floatingCouponFlag: Boolean(row.floatingCouponFlag),
		amortizationFlag: Boolean(row.amortizationFlag),
		perpetualFlag: Boolean(row.perpetualFlag),
		buyBackDate: row.buyBackDate ?? undefined,
		maturityDate: row.maturityDate ?? undefined,
		boardId: row.boardId ?? undefined,
	}))
}

function toSqliteParams<T extends object>(record: T) {
	return Object.fromEntries(
		Object.entries(record as Record<string, unknown>).map(([key, value]) => [`$${key}`, normalizeSqliteValue(value)]),
	)
}

function normalizeSqliteValue(value: unknown) {
	if (typeof value === "boolean") {
		return value ? 1 : 0
	}

	return value ?? null
}

function toSnakeCase(value: string) {
	return value.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}
