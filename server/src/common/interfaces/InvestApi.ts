export interface MoneyLike {
	units: number
	nano: number
	currency?: string
}

export interface ApiBond {
	[key: string]: unknown
	uid: string
	figi: string
	ticker: string
	name: string
	currency: string
	buyBackDate?: Date | string
	maturityDate?: Date | string
}

export interface ApiCoupon {
	[key: string]: unknown
	couponNumber: number
	couponDate: Date | string
	payOneBond?: MoneyLike
}

export interface LastPrice {
	figi: string
	price?: MoneyLike
}

export interface BondsResponse {
	instruments: ApiBond[]
}

export interface BondCouponsResponse {
	events?: ApiCoupon[]
}

export interface LastPricesResponse {
	lastPrices: LastPrice[]
}

export interface GetBondsParams {
	instrumentStatus: InstrumentStatus
}

export interface GetLastPricesParams {
	figi: string[]
	instrumentId: string[]
}

export interface GetBondCouponsParams {
	figi: string
	from?: Date
	to?: Date
	instrumentId?: string
}

export interface InvestApi {
	instruments: {
		bonds(params: GetBondsParams): Promise<BondsResponse>
		getBondCoupons(params: GetBondCouponsParams): Promise<BondCouponsResponse>
	}
	marketdata: {
		getLastPrices(params: GetLastPricesParams): Promise<LastPricesResponse>
	}
}

export enum InstrumentStatus {
	INSTRUMENT_STATUS_BASE = 1,
}
