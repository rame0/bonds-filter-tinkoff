"use strict"

// const DbService = require("moleculer-db")
// const MongooseAdapter = require("moleculer-db-adapter-mongoose")

import { TinkoffInvestApi } from "@psqq/tinkoff-invest-api"
import { InstrumentStatus, type BondsResponse } from "@psqq/tinkoff-invest-api/cjs/generated/instruments"
import { GetLastPricesResponse } from "@psqq/tinkoff-invest-api/cjs/generated/marketdata"
import { CombinedBondsResponse } from "../common/CombinedBondsResponse"

module.exports = {
	name: "bonds",
	mixins: [],
	// adapter: new MongooseAdapter(process.env.MONGO_URI || "mongodb://localhost/moleculer-blog", { useNewUrlParser: true, useUnifiedTopology: true }),

	settings: {},

	actions: {
		async instruments(ctx) {
			const api: TinkoffInvestApi = this.api

			const bonds = await api.instruments.bonds({
				instrumentStatus: InstrumentStatus.INSTRUMENT_STATUS_BASE,
			})

			const instrumentIDs: string[] = bonds.instruments.map(instrument => instrument.uid)
			const prices: GetLastPricesResponse = await api.marketdata.getLastPrices({
				figi: [],
				instrumentId: instrumentIDs,
			})

			const response: CombinedBondsResponse[] = bonds.instruments.map(t1 => ({ ...t1, ...prices.lastPrices.find(t2 => t2.figi === t1.figi) }))
			console.log(response.slice(0, 10))
			return bonds.instruments
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
