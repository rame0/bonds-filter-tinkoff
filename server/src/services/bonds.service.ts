"use strict"

// const DbService = require("moleculer-db")
// const MongooseAdapter = require("moleculer-db-adapter-mongoose")

import { TinkoffInvestApi } from "@psqq/tinkoff-invest-api"
import { InstrumentStatus } from "@psqq/tinkoff-invest-api/cjs/generated/instruments"

module.exports = {
	name: "bonds",
	mixins: [],
	// adapter: new MongooseAdapter(process.env.MONGO_URI || "mongodb://localhost/moleculer-blog", { useNewUrlParser: true, useUnifiedTopology: true }),

	settings: {},

	actions: {
		instruments(ctx) {
			const api: TinkoffInvestApi = this.api
			// this.logger.info("CTX", ctx)
			const bonds = api.instruments.bonds({
				instrumentStatus: InstrumentStatus.INSTRUMENT_STATUS_BASE,
			})
			this.logger.info("Bonds", bonds)
			return bonds
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
