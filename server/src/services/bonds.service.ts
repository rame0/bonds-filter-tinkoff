"use strict"
import * as fs from "fs"
import { Helpers, TinkoffInvestApi } from "@psqq/tinkoff-invest-api"
import { InstrumentStatus, type BondsResponse } from "@psqq/tinkoff-invest-api/cjs/generated/instruments"
import { GetLastPricesResponse } from "@psqq/tinkoff-invest-api/cjs/generated/marketdata"
import { type MoneyValue, type Quotation } from "@psqq/tinkoff-invest-api/src/generated/common"
import axios, { AxiosInstance } from "axios"
import { CombinedBondsResponse } from "../common/CombinedBondsResponse"
import { sleep } from "../common/utils/sleep"
import path from "path"

module.exports = {
	name: "bonds",
	// adapter: new MongooseAdapter(process.env.MONGO_URI || "mongodb://localhost/moleculer-blog", { useNewUrlParser: true, useUnifiedTopology: true }),

	settings: {},

	actions: {
		instruments: {
			params: {},
			cache: true,
			async handler(ctx): Promise<CombinedBondsResponse[]> {
				const cachePath = path.join(__dirname, "../caches/bonds.json")

				if (fs.existsSync(cachePath)) {
					const { mtime } = fs.statSync(cachePath)
					if (mtime.getTime() > new Date().getTime() - 1000 * 60 * 60 * 4) {
						return JSON.parse(fs.readFileSync(cachePath, "utf8"))
					}
				}
				const api: TinkoffInvestApi = this.api
				const nowDate = new Date()

				const bonds = await api.instruments.bonds({
					instrumentStatus: InstrumentStatus.INSTRUMENT_STATUS_BASE,
				})

				const instrumentIDs: string[] = bonds.instruments.map(instrument => instrument.uid)
				const prices: GetLastPricesResponse = await api.marketdata.getLastPrices({
					figi: [],
					instrumentId: instrumentIDs,
				})

				const isMoney = (value: any): value is MoneyValue => value.hasOwnProperty("units") && value.hasOwnProperty("nano")
				const isQuote = (value: any): value is Quotation => value.hasOwnProperty("units") && value.hasOwnProperty("nano")

				const response: CombinedBondsResponse[] = []
				let i = 0
				for (const t1 of bonds.instruments) {
					const instrument: CombinedBondsResponse = {} as CombinedBondsResponse
					Object.keys(t1).map(key => {
						if (t1[key] === undefined) {
							instrument[key] = undefined
						} else if (isMoney(t1[key]) || isQuote(t1[key])) {
							instrument[key] = Helpers.toNumber(t1[key])
						} else {
							instrument[key] = t1[key]
						}
					})
					const lastPrice = prices.lastPrices.find(t2 => t2.figi === t1.figi)
					instrument.price = Helpers.toNumber(lastPrice?.price)

					await sleep(307)
					this.logger.info(++i)

					const toDate = new Date()
					toDate.setFullYear(nowDate.getFullYear() + 100)
					instrument.coupons = (await api.instruments.getBondCoupons({
						figi: instrument.figi,
						from: new Date(0),
						to: toDate,
					})).events

					instrument.leftCouponCount = 0
					instrument.leftToPay = 0
					instrument.yieldToMaturity = 0
					instrument.yieldToBuyBack = 0
					const dates: number[] = []
					instrument.coupons.forEach(coupon => {
						coupon.payout = Helpers.toNumber(coupon.payOneBond)
						coupon.isPaid = coupon.couponDate < nowDate
						if (!coupon.isPaid) {
							instrument.leftCouponCount++
							instrument.leftToPay += coupon.payout
							instrument.yieldToMaturity += coupon.payout
							if (coupon.payout > 0) {
								dates.push(coupon.couponDate.getTime())
								instrument.yieldToBuyBack += coupon.payout
							}
						}
					})
					instrument.buyBackDate = dates.length > 0 ? new Date(Math.max(...dates)) : undefined

					response.push(instrument)
				}

				fs.writeFileSync(cachePath, JSON.stringify(response))
				return response
			},
		},
		get: {
			params: {
				id: "string",
			},
			handler(ctx) {
				const marketData = this.api.instruments.getBondCoupons({
					figi: ctx.params.id,
				})
			},
		},
	},


	created() {
		this.api = new TinkoffInvestApi({
			token: process.env.TINKOFF_API_TOKEN,
			appName: "rame0/bonds-filter-tinkoff",
		})

		this.httpClient = axios.create({})
	},
}
