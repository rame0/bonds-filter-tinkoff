import moment from "moment"

export enum LiquidityType {
	"unknown" = 0,
	"low" = 1,
	"high" = 2
}

export interface MoexSecurity {
	SECID: string,
	BOARDID: string,
	TYPE: number,
	FaceValue: number,
	FaceUnit: string,
	BondPrice: number,
	CouponPeriod: number,
	BondVolume: number,
	BondYield: number,
	liquidity: LiquidityType,
	BondDuration?: number,
	MonthsOfPaymentsDates?: number,

	coupons?: MoexCoupon[],
	couponsYield?: number,
	yield?: number,

	trades?: MoexTrade[],
	tradeDays?: number,
}

export type MoexResults = Record<string, MoexSecurity>


export interface MoexCoupon {
	date: moment.Moment
	faceUnit: string
	value: number
	valuePrc: number
	valueRub: number
}

export interface MoexTrade {
	date: moment.Moment,
	volume: number,
	numTrades: number,
}
