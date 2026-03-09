"use strict"
import Cache from "file-system-cache"
import { Coupon } from "@psqq/tinkoff-invest-api/cjs/generated/instruments"
import moment from "moment"
import { CombinedBondsResponse } from "../common/interfaces/CombinedBondsResponse"
import { api } from "../common/api"
import { Helpers } from "@psqq/tinkoff-invest-api"
import { roundTo } from "../common/utils/round"

export default {
	name: "bonds",
	// adapter: new MongooseAdapter(process.env.MONGO_URI || "mongodb://localhost/moleculer-blog", { useNewUrlParser: true, useUnifiedTopology: true }),

	settings: {},

	actions: {
		instruments: {
			params: {},
			cache: true,
			async handler(ctx): Promise<CombinedBondsResponse[]> {
				const cache = Cache({ ttl: 60 * 60 * 4 })

				return await cache.get("bonds", [])
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
						.filter((coupon) => moment(coupon.couponDate).isAfter(now))
						.map((coupon) => {
							coupon["payout"] = roundTo(Helpers.toNumber(coupon.payOneBond))
							return coupon
						})
					return coupons.slice(0, limit)
				} catch (err) {
					ctx.meta.$statusCode = 502
					throw new Error(
						`Failed to fetch coupons for ${ctx.params.id}: ${err?.message ?? err}`
					)
				}
			},
		},
	},
}
