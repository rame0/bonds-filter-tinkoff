export interface MoneyLike {
	units: number
	nano: number
	currency?: string
}

export interface ApiBond {
	uid: string
	figi: string
	ticker: string
	name: string
	currency: string
	buyBackDate?: Date | string
	maturityDate?: Date | string
	[key: string]: unknown
}

export interface ApiCoupon {
	couponNumber: number
	couponDate: Date | string
	payOneBond?: MoneyLike
	[key: string]: unknown
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
	INSTRUMENT_STATUS_UNSPECIFIED = 0,
	INSTRUMENT_STATUS_BASE = 1,
	INSTRUMENT_STATUS_ALL = 2,
}

export enum SecurityTradingStatus {
	SECURITY_TRADING_STATUS_UNSPECIFIED = 0,
	SECURITY_TRADING_STATUS_NOT_AVAILABLE_FOR_TRADING = 1,
	SECURITY_TRADING_STATUS_OPENING_PERIOD = 2,
	SECURITY_TRADING_STATUS_CLOSING_PERIOD = 3,
	SECURITY_TRADING_STATUS_BREAK_IN_TRADING = 4,
	SECURITY_TRADING_STATUS_NORMAL_TRADING = 5,
	SECURITY_TRADING_STATUS_CLOSING_AUCTION = 6,
	SECURITY_TRADING_STATUS_DARK_POOL_AUCTION = 7,
	SECURITY_TRADING_STATUS_DISCRETE_AUCTION = 8,
	SECURITY_TRADING_STATUS_OPENING_AUCTION_PERIOD = 9,
	SECURITY_TRADING_STATUS_TRADING_AT_CLOSING_AUCTION_PRICE = 10,
	SECURITY_TRADING_STATUS_SESSION_ASSIGNED = 11,
	SECURITY_TRADING_STATUS_SESSION_CLOSE = 12,
	SECURITY_TRADING_STATUS_SESSION_OPEN = 13,
	SECURITY_TRADING_STATUS_DEALER_NORMAL_TRADING = 14,
	SECURITY_TRADING_STATUS_DEALER_BREAK_IN_TRADING = 15,
	SECURITY_TRADING_STATUS_DEALER_NOT_AVAILABLE_FOR_TRADING = 16,
}
