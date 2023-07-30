"use strict"

// const DbService = require("moleculer-db")
// const MongooseAdapter = require("moleculer-db-adapter-mongoose")

import { Helpers, TinkoffInvestApi } from "@psqq/tinkoff-invest-api"
import { InstrumentStatus, type BondsResponse } from "@psqq/tinkoff-invest-api/cjs/generated/instruments"
import { GetLastPricesResponse } from "@psqq/tinkoff-invest-api/cjs/generated/marketdata"
import { type MoneyValue, type Quotation } from "@psqq/tinkoff-invest-api/src/generated/common"
import { CombinedBondsResponse } from "../common/CombinedBondsResponse"

module.exports = {
	name: "bonds",
	mixins: [],
	// adapter: new MongooseAdapter(process.env.MONGO_URI || "mongodb://localhost/moleculer-blog", { useNewUrlParser: true, useUnifiedTopology: true }),

	settings: {},

	actions: {
		async instruments(ctx): Promise<CombinedBondsResponse[]> {
			const api: TinkoffInvestApi = this.api

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

			const response: CombinedBondsResponse[] = bonds.instruments.map(t1 => {
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
				return instrument
			})
			console.log(response.slice(0, 10))
			return response
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
	},
}
