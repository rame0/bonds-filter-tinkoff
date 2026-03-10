"use strict"
import { Helpers } from "@psqq/tinkoff-invest-api"
import { Coupon } from "@psqq/tinkoff-invest-api/cjs/generated/instruments"
import moment from "moment"
import { CombinedBondsResponse } from "../common/interfaces/CombinedBondsResponse"
import { api } from "../common/api"
import { roundTo } from "../common/utils/round"
import { getOrBuildBondsData } from "../common/getOrBuildBondsData"

export default {
	name: "bonds",
	// adapter: new MongooseAdapter(process.env.MONGO_URI || "mongodb://localhost/moleculer-blog", { useNewUrlParser: true, useUnifiedTopology: true }),

	settings: {},

	actions: {
		instruments: {
			params: {},
			cache: true,
			async handler(ctx): Promise<CombinedBondsResponse[]> {
				try {
					return await getOrBuildBondsData()
				} catch (err) {
					ctx.meta.$statusCode = 503
					console.error("[bonds.instruments] Failed to build bonds data:", err)
					throw new Error("Failed to build bonds data")
				}
			},
		},
		coupons: {
			params: {
				id: "string",
				limit: { type: "number", optional: true },
			},
			cache: true,
			async handler(ctx) {
				const limit = ctx.params.limit ?? 12
				try {
					let coupons: Coupon[] =
						(await api.instruments.getBondCoupons({ figi: ctx.params.id })).events || []
					coupons = coupons.sort((a, b) => {
						if (a.couponNumber > b.couponNumber) return 1
						if (a.couponNumber < b.couponNumber) return -1
						return 0
					})
					const now = moment.now()
					coupons = coupons
						.filter(coupon => moment(coupon.couponDate).isAfter(now))
						.map(coupon => {
							const couponWithPayout = coupon as Coupon & { payout?: number }
							couponWithPayout.payout = roundTo(Helpers.toNumber(coupon.payOneBond))
							return couponWithPayout
						})
					return coupons.slice(0, limit)
				} catch (err) {
					ctx.meta.$statusCode = 502
					console.error(`[bonds.coupons] Failed to fetch coupons for ${ctx.params.id}:`, err)
					throw new Error(`Failed to fetch coupons for ${ctx.params.id}`)
				}
			},
		},
	},
}
