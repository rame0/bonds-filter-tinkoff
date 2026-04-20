import { api } from "./api"
import {
	InstrumentStatus,
	type ApiBond,
	type ApiCoupon,
	type LastPrice,
} from "./interfaces/InvestApi"

const COUPON_LOOKUP_FROM = new Date("2000-01-01T00:00:00.000Z")
const COUPON_LOOKUP_TO = new Date("2100-01-01T00:00:00.000Z")

export async function listBonds(): Promise<ApiBond[]> {
	const { instruments } = await api.instruments.bonds({
		instrumentStatus: InstrumentStatus.INSTRUMENT_STATUS_BASE,
	})

	return instruments
}

export async function getLastPrices(instrumentIds: string[]): Promise<LastPrice[]> {
	const { lastPrices } = await api.marketdata.getLastPrices({
		figi: [],
		instrumentId: instrumentIds,
	})

	return lastPrices
}

export async function getBondCoupons(figi: string): Promise<ApiCoupon[]> {
	const { events } = await api.instruments.getBondCoupons({
		figi,
		from: COUPON_LOOKUP_FROM,
		to: COUPON_LOOKUP_TO,
		instrumentId: figi,
	})
	return events || []
}
