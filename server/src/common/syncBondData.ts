import moment from "moment"
import { listDerivedMetricInputs } from "./bondDataSnapshot"
import { getCouponSummary } from "./getCouponSummary"
import { convertToRub, getOrRefreshCurrencyRates } from "./getCurrencyRates"
import { getMoexCouponsData, getMoexLiquidityData, getMoexMarketData } from "./getMoexData"
import { type CombinedCoupon } from "./interfaces/CombinedCoupon"
import { type ApiBond, type LastPrice } from "./interfaces/InvestApi"
import * as investApiFacade from "./investApiFacade"
import {
	listBondInstrumentSyncRefs,
	listCouponRefreshCandidates,
	listLiquidityRefreshCandidates,
	replaceBondCouponEvents,
	upsertBondCouponAggregates,
	upsertBondDerivedMetrics,
	upsertBondInstrument,
	upsertBondLiquiditySnapshot,
	upsertBondMarketSnapshot,
	upsertBondSyncState,
	type BondCouponAggregateRecord,
	type BondCouponEventRecord,
	type BondInstrumentRecord,
	type BondInstrumentSyncRef,
} from "./bondDataStorage"
import { isMoneyLike, toNumber } from "./utils/money"
import { roundTo } from "./utils/round"

const MARKET_TTL_MINUTES = 30
const LIQUIDITY_TTL_HOURS = 4
const COUPON_EXACT_TTL_HOURS = 24
const COUPON_ESTIMATED_TTL_HOURS = 6

export async function syncInstrumentCore(now = new Date()) {
	const sourceUpdatedAt = now.toISOString()
	const bonds = await investApiFacade.listBonds()

	for (const bond of bonds) {
		const record = normalizeBondInstrument(bond, sourceUpdatedAt)
		upsertBondInstrument(record)
		upsertBondSyncState(record.uid, {
			instrumentCoreUpdatedAt: sourceUpdatedAt,
			marketExpiresAt: new Date(now.getTime()).toISOString(),
			couponEventsExpiresAt: new Date(now.getTime()).toISOString(),
			liquidityExpiresAt: new Date(now.getTime()).toISOString(),
			needsRecompute: true,
			needsCouponRefresh: true,
			needsLiquidityRefresh: true,
		})
	}

	return { total: bonds.length }
}

export async function syncMarketSnapshot(now = new Date()) {
	const refs = listBondInstrumentSyncRefs()
	if (refs.length < 1) {
		return { total: 0 }
	}

	const [prices, moexMarketData] = await Promise.all([
		investApiFacade.getLastPrices(refs.map(ref => ref.uid)),
		getMoexMarketData(refs.map(ref => ref.ticker)),
	])
	const priceByFigi = new Map(prices.map((item: LastPrice) => [item.figi, item.price]))
	const updatedAt = now.toISOString()
	const expiresAt = new Date(now.getTime() + MARKET_TTL_MINUTES * 60 * 1000).toISOString()

	for (const ref of refs) {
		const lastPrice = priceByFigi.get(ref.figi)
		const moex = moexMarketData[ref.ticker]
		upsertBondMarketSnapshot({
			uid: ref.uid,
			pricePercent: roundTo(toNumber(lastPrice)),
			priceSource: lastPrice ? "tinkoff" : undefined,
			bondYieldPercent: moex?.BondYield ? roundTo(moex.BondYield) : undefined,
			bondYieldSource: moex?.BondYield ? "moex" : undefined,
			durationMonths: moex?.BondDuration ? roundTo(moex.BondDuration) : undefined,
			durationSource: moex?.BondDuration ? "moex" : undefined,
			marketCurrency: ref.currency,
			moexBoardId: moex?.BOARDID,
			sourceUpdatedAt: updatedAt,
			updatedAt,
		})
		upsertBondSyncState(ref.uid, {
			marketSnapshotUpdatedAt: updatedAt,
			marketExpiresAt: expiresAt,
			needsRecompute: true,
		})
	}

	return { total: refs.length }
}

export async function syncCouponEvents(now = new Date()) {
	const nowIso = now.toISOString()
	const refs = listCouponRefreshCandidates(nowIso)
	if (refs.length < 1) {
		return { total: 0 }
	}

	const rates = await getOrRefreshCurrencyRates()
	const moexCoupons = await getMoexCouponsData(refs.map(ref => ({ ticker: ref.ticker, boardId: ref.boardId })), moment(now))
	let updated = 0

	for (const ref of refs) {
		const moexSecurity = moexCoupons[ref.ticker]
		const moexEvents = normalizeMoexCouponEvents(ref, moexSecurity?.coupons ?? [], rates, now)
		let mergedEvents = moexEvents

		if (shouldLoadTinkoffFallback(moexEvents, moexSecurity?.couponsYield)) {
			const summary = await getCouponSummary(ref.figi, ref.floatingCouponFlag, moment(now))
			if (summary) {
				mergedEvents = mergeCouponEvents(
					moexEvents,
					normalizeTinkoffCouponEvents(ref, summary.coupons, rates, now),
				)
			}
		}

		replaceBondCouponEvents(ref.uid, mergedEvents)
		upsertBondCouponAggregates(buildCouponAggregate(ref, mergedEvents, now))
		upsertBondSyncState(ref.uid, {
			couponEventsUpdatedAt: nowIso,
			couponEventsExpiresAt: calculateCouponRefreshExpiresAt(mergedEvents, now),
			needsCouponRefresh: false,
			needsRecompute: true,
		})
		updated += 1
	}

	return { total: updated }
}

export async function syncLiquiditySnapshot(now = new Date()) {
	const refs = listLiquidityRefreshCandidates(now.toISOString())
	if (refs.length < 1) {
		return { total: 0 }
	}

	const updatedAt = now.toISOString()
	const expiresAt = new Date(now.getTime() + LIQUIDITY_TTL_HOURS * 60 * 60 * 1000).toISOString()
	const liquidity = await getMoexLiquidityData(refs.map(ref => ({ ticker: ref.ticker, boardId: ref.boardId })))

	for (const ref of refs) {
		const item = liquidity[ref.ticker]
		upsertBondLiquiditySnapshot({
			uid: ref.uid,
			liquidity: item?.liquidity,
			tradeDays: item?.tradeDays,
			volumeSum: item?.BondVolume,
			windowFrom: now.toISOString(),
			windowTo: now.toISOString(),
			liquiditySource: item ? "moex" : undefined,
			updatedAt,
		})
		upsertBondSyncState(ref.uid, {
			liquiditySnapshotUpdatedAt: updatedAt,
			liquidityExpiresAt: expiresAt,
			needsLiquidityRefresh: false,
			needsRecompute: true,
		})
	}

	return { total: refs.length }
}

export async function recomputeDerivedMetrics(now = new Date()) {
	const rates = await getOrRefreshCurrencyRates()
	const rows = listDerivedMetricInputs(true)
	let updated = 0

	for (const row of rows) {
		const realPriceLocal = row.nominal !== undefined && row.pricePercent !== undefined
			? roundTo((row.nominal * row.pricePercent) / 100 + (row.aciValue ?? 0))
			: undefined
		const realPriceRub = convertSafely(realPriceLocal, row.currency, rates)
		const bondYieldPercentFinal = row.bondYieldPercent
			?? deriveBondYieldPercent(row.annualCouponSumRub, realPriceRub)
		const durationMonthsFinal = row.durationMonths ?? deriveDurationMonths(now, row.buyBackDate, row.maturityDate)
		const bondYieldFinalSource = row.bondYieldPercent !== undefined
			? row.bondYieldSource
			: bondYieldPercentFinal !== undefined
				? "derived_coupon_yield"
				: undefined
		const durationFinalSource = row.durationMonths !== undefined
			? row.durationSource
			: durationMonthsFinal !== undefined
				? "calendar_fallback"
				: undefined

		upsertBondDerivedMetrics({
			uid: row.uid,
			realPriceRub,
			couponsYieldRub12m: row.annualCouponSumRub,
			couponsYieldSource: row.aggregateSource,
			bondYieldPercentFinal,
			bondYieldFinalSource,
			durationMonthsFinal,
			durationFinalSource,
			leftCouponCount: row.leftCouponCount,
			leftToPayRub: row.leftToPayRub,
			dirtyReason: undefined,
			computedAt: now.toISOString(),
		})
		upsertBondSyncState(row.uid, {
			derivedMetricsUpdatedAt: now.toISOString(),
			needsRecompute: false,
		})
		updated += 1
	}

	return { total: updated }
}

export async function syncAllBondData(now = new Date()) {
	const instrumentCore = await syncInstrumentCore(now)
	const marketSnapshot = await syncMarketSnapshot(now)
	const couponEvents = await syncCouponEvents(now)
	const liquiditySnapshot = await syncLiquiditySnapshot(now)
	const derivedMetrics = await recomputeDerivedMetrics(now)

	return {
		instrumentCore,
		marketSnapshot,
		couponEvents,
		liquiditySnapshot,
		derivedMetrics,
	}
}

function normalizeBondInstrument(bond: ApiBond, updatedAt: string): BondInstrumentRecord {
	const normalized: Record<string, unknown> = {}
	for (const key of Object.keys(bond)) {
		const value = bond[key]
		if (value === undefined) {
			normalized[key] = undefined
		} else if (isMoneyLike(value)) {
			normalized[key] = toNumber(value)
		} else {
			normalized[key] = value
		}
	}

	return {
		uid: String(normalized.uid),
		figi: String(normalized.figi),
		ticker: String(normalized.ticker),
		isin: toOptionalString(normalized.isin),
		name: String(normalized.name),
		currency: toOptionalString(normalized.currency),
		nominal: toOptionalNumber(normalized.nominal),
		aciValue: toOptionalNumber(normalized.aciValue),
		countryOfRisk: toOptionalString(normalized.countryOfRisk),
		sector: toOptionalString(normalized.sector),
		issueKind: toOptionalString(normalized.issueKind),
		realExchange: toOptionalString(normalized.realExchange),
		riskLevel: toOptionalNumber(normalized.riskLevel),
		couponQuantityPerYear: toOptionalNumber(normalized.couponQuantityPerYear),
		floatingCouponFlag: Boolean(normalized.floatingCouponFlag),
		amortizationFlag: Boolean(normalized.amortizationFlag),
		perpetualFlag: Boolean(normalized.perpetualFlag),
		subordinatedFlag: Boolean(normalized.subordinatedFlag),
		buyAvailableFlag: Boolean(normalized.buyAvailableFlag),
		sellAvailableFlag: Boolean(normalized.sellAvailableFlag),
		apiTradeAvailableFlag: Boolean(normalized.apiTradeAvailableFlag),
		forIisFlag: Boolean(normalized.forIisFlag),
		forQualInvestorFlag: Boolean(normalized.forQualInvestorFlag),
		otcFlag: Boolean(normalized.otcFlag),
		weekendFlag: Boolean(normalized.weekendFlag),
		buyBackDate: toOptionalIsoString(normalized.buyBackDate),
		maturityDate: toOptionalIsoString(normalized.maturityDate),
		classCode: toOptionalString(normalized.classCode),
		sourceUpdatedAt: updatedAt,
		updatedAt,
	}
}

function normalizeMoexCouponEvents(
	ref: BondInstrumentSyncRef,
	coupons: { date: moment.Moment, faceUnit: string, value: number, valuePrc: number, valueRub: number }[],
	rates: Awaited<ReturnType<typeof getOrRefreshCurrencyRates>>,
	now: Date,
): BondCouponEventRecord[] {
	return coupons
		.filter(coupon => coupon.date.isAfter(now))
		.map((coupon, index) => ({
			eventKey: `${ref.uid}:${coupon.date.toISOString()}:${index}`,
			uid: ref.uid,
			couponNumber: index + 1,
			eventDate: coupon.date.toISOString(),
			eventType: "coupon",
			couponValueNative: roundTo(coupon.value),
			couponCurrency: coupon.faceUnit,
			couponValueRub: coupon.valueRub > 0 ? roundTo(coupon.valueRub) : convertSafely(coupon.value, coupon.faceUnit, rates),
			couponPercent: roundTo(coupon.valuePrc),
			isFloating: ref.floatingCouponFlag,
			isAmortizing: false,
			isPerpetual: ref.perpetualFlag,
			isKnown: coupon.value > 0,
			isEstimated: false,
			source: "moex",
			sourcePriority: 1,
			rawFingerprint: `${coupon.faceUnit}:${coupon.value}:${coupon.valueRub}:${coupon.valuePrc}`,
			updatedAt: now.toISOString(),
		}))
}

function normalizeTinkoffCouponEvents(
	ref: BondInstrumentSyncRef,
	coupons: CombinedCoupon[],
	rates: Awaited<ReturnType<typeof getOrRefreshCurrencyRates>>,
	now: Date,
): BondCouponEventRecord[] {
	return coupons
		.filter(coupon => moment(coupon.couponDate).isAfter(now))
		.map(coupon => {
			const eventDate = moment(coupon.couponDate).toISOString()
			const nativeValue = toOptionalNumber(coupon.payout)
			return {
				eventKey: `${ref.uid}:${eventDate}:${coupon.couponNumber}`,
				uid: ref.uid,
				couponNumber: typeof coupon.couponNumber === "number" ? coupon.couponNumber : undefined,
				eventDate,
				eventType: "coupon",
				couponValueNative: nativeValue,
				couponCurrency: ref.currency,
				couponValueRub: convertSafely(nativeValue, ref.currency, rates),
				isFloating: ref.floatingCouponFlag,
				isAmortizing: false,
				isPerpetual: ref.perpetualFlag,
				isKnown: !coupon.isEstimated && nativeValue !== undefined,
				isEstimated: Boolean(coupon.isEstimated),
				estimationMethod: coupon.isEstimated ? "last_known_coupon" : undefined,
				source: coupon.isEstimated ? "tinkoff_estimated" : "tinkoff",
				sourcePriority: coupon.isEstimated ? 3 : 2,
				rawFingerprint: `${coupon.couponNumber}:${nativeValue}:${coupon.isEstimated ? 1 : 0}`,
				updatedAt: now.toISOString(),
			}
		})
}

function mergeCouponEvents(primary: BondCouponEventRecord[], fallback: BondCouponEventRecord[]) {
	const byKey = new Map(primary.map(event => [event.eventKey, event]))
	for (const fallbackEvent of fallback) {
		const current = byKey.get(fallbackEvent.eventKey)
		if (!current) {
			byKey.set(fallbackEvent.eventKey, fallbackEvent)
			continue
		}

		if ((current.couponValueRub === undefined || current.couponValueRub <= 0) && fallbackEvent.couponValueRub !== undefined) {
			byKey.set(fallbackEvent.eventKey, {
				...current,
				couponValueNative: fallbackEvent.couponValueNative,
				couponCurrency: fallbackEvent.couponCurrency,
				couponValueRub: fallbackEvent.couponValueRub,
				isKnown: fallbackEvent.isKnown,
				isEstimated: fallbackEvent.isEstimated,
				estimationMethod: fallbackEvent.estimationMethod,
				source: fallbackEvent.source,
				sourcePriority: fallbackEvent.sourcePriority,
				rawFingerprint: fallbackEvent.rawFingerprint,
			})
		}
	}

	return [...byKey.values()].sort((left, right) => left.eventDate.localeCompare(right.eventDate))
}

function buildCouponAggregate(ref: BondInstrumentSyncRef, events: BondCouponEventRecord[], now: Date): BondCouponAggregateRecord {
	const oneYearLater = moment(now).add(1, "year")
	const futureEvents = events
		.filter(event => moment(event.eventDate).isAfter(now))
		.sort((left, right) => left.eventDate.localeCompare(right.eventDate))
	const annualCouponSumRub = roundTo(futureEvents.reduce((sum, event) =>
		moment(event.eventDate).isSameOrBefore(oneYearLater)
			? sum + (event.couponValueRub ?? 0)
			: sum
	, 0))
	const leftToPayRub = roundTo(futureEvents.reduce((sum, event) => sum + (event.couponValueRub ?? 0), 0))
	const nextCoupon = futureEvents[0]
	const estimatedCount = futureEvents.filter(event => event.isEstimated).length
	const knownCount = futureEvents.filter(event => event.isKnown && !event.isEstimated).length

	return {
		uid: ref.uid,
		annualCouponSumRub,
		leftToPayRub,
		leftCouponCount: futureEvents.length,
		nextCouponDate: nextCoupon?.eventDate,
		nextCouponValueRub: nextCoupon?.couponValueRub,
		couponProjectionQuality: estimatedCount < 1 ? "exact" : knownCount > 0 ? "mixed" : "estimated",
		hasEstimatedFutureCoupons: estimatedCount > 0,
		hasAmortization: ref.amortizationFlag,
		hasFloatingCoupons: ref.floatingCouponFlag,
		aggregateSource: nextCoupon?.source,
		computedAt: now.toISOString(),
	}
}

function shouldLoadTinkoffFallback(events: BondCouponEventRecord[], annualMoexCouponsYield: number | undefined) {
	if (events.length < 1) {
		return true
	}

	if (!annualMoexCouponsYield || annualMoexCouponsYield <= 0) {
		return true
	}

	return events.some(event => event.couponValueRub === undefined || event.couponValueRub <= 0)
}

function calculateCouponRefreshExpiresAt(events: BondCouponEventRecord[], now: Date) {
	if (events.some(event => event.isEstimated)) {
		return new Date(now.getTime() + COUPON_ESTIMATED_TTL_HOURS * 60 * 60 * 1000).toISOString()
	}

	const nextCouponDate = events.find(event => moment(event.eventDate).isAfter(now))?.eventDate
	if (!nextCouponDate) {
		return new Date(now.getTime() + COUPON_EXACT_TTL_HOURS * 60 * 60 * 1000).toISOString()
	}

	const nextCouponAt = new Date(nextCouponDate).valueOf()
	const exactExpiresAt = now.getTime() + COUPON_EXACT_TTL_HOURS * 60 * 60 * 1000
	return new Date(Math.min(nextCouponAt, exactExpiresAt)).toISOString()
}

function convertSafely(amount: number | undefined, currency: string | undefined, rates: Awaited<ReturnType<typeof getOrRefreshCurrencyRates>>) {
	if (amount === undefined) {
		return undefined
	}

	try {
		return convertToRub(amount, currency, rates)
	} catch {
		return undefined
	}
}

function deriveBondYieldPercent(annualCouponSumRub: number | undefined, realPriceRub: number | undefined) {
	if (annualCouponSumRub === undefined || realPriceRub === undefined || realPriceRub <= 0) {
		return undefined
	}

	return roundTo((annualCouponSumRub / realPriceRub) * 100)
}

function deriveDurationMonths(now: Date, buyBackDate?: string, maturityDate?: string) {
	const dateValue = buyBackDate ?? maturityDate
	if (!dateValue) {
		return undefined
	}

	const date = moment(dateValue)
	if (!date.isValid()) {
		return undefined
	}

	return roundTo(date.diff(moment(now), "days") / 30) ?? 0
}

function toOptionalString(value: unknown) {
	return typeof value === "string" && value !== "" ? value : undefined
}

function toOptionalNumber(value: unknown) {
	return typeof value === "number" && Number.isFinite(value) ? value : undefined
}

function toOptionalIsoString(value: unknown) {
	if (value instanceof Date) {
		return value.toISOString()
	}

	if (typeof value === "string" && value !== "") {
		const parsed = new Date(value)
		return Number.isNaN(parsed.valueOf()) ? value : parsed.toISOString()
	}

	return undefined
}
