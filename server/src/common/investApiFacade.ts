import { api } from "./api"
import {
	InstrumentStatus,
	type ApiBond,
	type ApiCoupon,
	type LastPrice,
} from "./interfaces/InvestApi"

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
	const { events } = await api.instruments.getBondCoupons({ figi })
  return events || []
}
