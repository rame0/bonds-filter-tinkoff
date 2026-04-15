import moment from "moment"
import { listBondsByStatus } from "./investApiFacade"
import { InstrumentStatus, SecurityTradingStatus } from "./interfaces/InvestApi"
import type { PrimaryPlacement } from "./interfaces/PrimaryPlacement"
import { isMoneyLike, toNumber } from "./utils/money"

const ACTIVE_TRADING_STATUSES = new Set<number>([
	SecurityTradingStatus.SECURITY_TRADING_STATUS_OPENING_PERIOD,
	SecurityTradingStatus.SECURITY_TRADING_STATUS_CLOSING_PERIOD,
	SecurityTradingStatus.SECURITY_TRADING_STATUS_BREAK_IN_TRADING,
	SecurityTradingStatus.SECURITY_TRADING_STATUS_NORMAL_TRADING,
	SecurityTradingStatus.SECURITY_TRADING_STATUS_CLOSING_AUCTION,
	SecurityTradingStatus.SECURITY_TRADING_STATUS_DARK_POOL_AUCTION,
	SecurityTradingStatus.SECURITY_TRADING_STATUS_DISCRETE_AUCTION,
	SecurityTradingStatus.SECURITY_TRADING_STATUS_OPENING_AUCTION_PERIOD,
	SecurityTradingStatus.SECURITY_TRADING_STATUS_TRADING_AT_CLOSING_AUCTION_PRICE,
	SecurityTradingStatus.SECURITY_TRADING_STATUS_SESSION_OPEN,
	SecurityTradingStatus.SECURITY_TRADING_STATUS_DEALER_NORMAL_TRADING,
	SecurityTradingStatus.SECURITY_TRADING_STATUS_DEALER_BREAK_IN_TRADING,
])

const UPCOMING_LOOKBACK_DAYS = 90

export async function buildPrimaryPlacementsData(): Promise<PrimaryPlacement[]> {
	const bonds = await listBondsByStatus(InstrumentStatus.INSTRUMENT_STATUS_ALL)
	const thresholdDate = moment().startOf("day").subtract(UPCOMING_LOOKBACK_DAYS, "days")

	return bonds
		.map(normalizeBond)
		.filter((bond): bond is PrimaryPlacement => {
			if (!hasPlacementSignal(bond)) {
				return false
			}

			if (bond.hasStartedTrading) {
				return false
			}

			if (!bond.placementDate) {
				return false
			}

			return moment(bond.placementDate).isSameOrAfter(thresholdDate)
		})
		.sort((left, right) => moment(left.placementDate).valueOf() - moment(right.placementDate).valueOf())
}

function normalizeBond(bond: Record<string, unknown>): PrimaryPlacement | Record<string, unknown> {
	const normalized: Record<string, unknown> = {}

	for (const key of Object.keys(bond)) {
		const value = bond[key]
		if (value === undefined) {
			normalized[key] = undefined
			continue
		}

		normalized[key] = isMoneyLike(value) ? toNumber(value) : value
	}

	const tradingStatus = Number(normalized.tradingStatus ?? SecurityTradingStatus.SECURITY_TRADING_STATUS_UNSPECIFIED)
	const hasStartedTrading = hasTradingSignal(normalized, tradingStatus)

	return {
		...normalized,
		isPrimaryCandidate: true,
		hasStartedTrading,
		primaryReason: buildPrimaryReason(normalized),
		tradingStatusLabel: getTradingStatusLabel(tradingStatus),
	} as PrimaryPlacement
}

function hasPlacementSignal(bond: Record<string, unknown>) {
	return Boolean(bond.placementDate || bond.placementPrice || Number(bond.issueSizePlan ?? 0) > 0)
}

function hasTradingSignal(bond: Record<string, unknown>, tradingStatus: number) {
	return Boolean(
		bond.first1dayCandleDate ||
		bond.first1minCandleDate ||
		bond.apiTradeAvailableFlag ||
		bond.buyAvailableFlag ||
		bond.sellAvailableFlag ||
		ACTIVE_TRADING_STATUSES.has(tradingStatus)
	)
}

function buildPrimaryReason(bond: Record<string, unknown>) {
	if (bond.placementDate) {
		return "Есть дата размещения, но нет признаков стартовавших торгов"
	}

	if (bond.placementPrice) {
		return "Есть цена размещения, но нет признаков стартовавших торгов"
	}

	return "Есть параметры выпуска, но нет признаков стартовавших торгов"
}

function getTradingStatusLabel(status: number) {
	switch (status) {
		case SecurityTradingStatus.SECURITY_TRADING_STATUS_NOT_AVAILABLE_FOR_TRADING:
			return "Недоступна для торгов"
		case SecurityTradingStatus.SECURITY_TRADING_STATUS_SESSION_ASSIGNED:
			return "Сессия назначена"
		case SecurityTradingStatus.SECURITY_TRADING_STATUS_SESSION_CLOSE:
			return "Сессия закрыта"
		case SecurityTradingStatus.SECURITY_TRADING_STATUS_UNSPECIFIED:
			return "Статус не определен"
		default:
			return `Торговый статус: ${status}`
	}
}
