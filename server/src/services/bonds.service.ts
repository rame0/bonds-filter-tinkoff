"use strict"
import moment from "moment"
import { CombinedBondsResponse } from "../common/interfaces/CombinedBondsResponse"
import { type ApiCoupon } from "../common/interfaces/InvestApi"
import { type BondsDataStatus } from "../common/interfaces/BondsDataStatus"
import { type PortfolioPositionInput } from "../common/interfaces/PortfolioMetrics"
import { getOrRefreshCurrencyRates } from "../common/getCurrencyRates"
import { getPortfolioMetrics } from "../common/getPortfolioMetrics"
import { getPortfolioTable } from "../common/getPortfolioTable"
import { getBondCoupons } from "../common/investApiFacade"
import { getBondFilterOptions, listBondsData } from "../common/listBondsData"
import { BondFilterOptionsResponse, BondListResponse } from "../common/interfaces/BondList"
import { toNumber } from "../common/utils/money"
import { roundTo } from "../common/utils/round"
import { ensureBondsDataBuild, getBondsDataStatus, getOrBuildBondsData } from "../common/getOrBuildBondsData"

export default {
	name: "bonds",
	// adapter: new MongooseAdapter(process.env.MONGO_URI || "mongodb://localhost/moleculer-blog", { useNewUrlParser: true, useUnifiedTopology: true }),

	settings: {},

		actions: {
		status: {
			params: {},
			cache: false,
			async handler(): Promise<BondsDataStatus> {
				await ensureBondsDataBuild()
				return getBondsDataStatus()
			},
		},
		instruments: {
			params: {
				page: { type: "number", optional: true, convert: true },
				pageSize: { type: "number", optional: true, convert: true },
				sortProp: { type: "string", optional: true },
				sortOrder: { type: "enum", values: ["ascending", "descending"], optional: true },
				filters: { type: "string", optional: true },
			},
			cache: true,
			async handler(ctx): Promise<BondListResponse> {
				try {
					const bonds = await getOrBuildBondsData()
					return listBondsData(bonds, {
						...ctx.params,
						filters: parseFilters(ctx.params.filters),
					})
				} catch (err) {
					ctx.meta.$statusCode = 503
					console.error("[bonds.instruments] Failed to build bonds data:", err)
					throw new Error("Failed to build bonds data")
				}
			},
		},
		filterOptions: {
			params: {},
			cache: true,
			async handler(): Promise<BondFilterOptionsResponse> {
				const bonds = await getOrBuildBondsData()
				return getBondFilterOptions(bonds)
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
					let coupons: ApiCoupon[] = await getBondCoupons(ctx.params.id)
					coupons = coupons.sort((a, b) => {
						if (a.couponNumber > b.couponNumber) return 1
						if (a.couponNumber < b.couponNumber) return -1
						return 0
					})
					const now = moment.now()
					coupons = coupons
						.filter(coupon => moment(coupon.couponDate).isAfter(now))
						.map(coupon => {
							const couponWithPayout = coupon as ApiCoupon & { payout?: number }
							couponWithPayout.payout = roundTo(toNumber(coupon.payOneBond))
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
		portfolioMetrics: {
			params: {
				positions: {
					type: "array",
					items: "object",
				},
			},
			cache: false,
			async handler(ctx) {
				const positions = ctx.params.positions as PortfolioPositionInput[]
				const [bonds, bondsStatus, rates] = await Promise.all([
					getOrBuildBondsData(),
					getBondsDataStatus(),
					getOrRefreshCurrencyRates(),
				])

				return getPortfolioMetrics(positions, bonds, rates, bondsStatus, moment())
			},
		},
		portfolioTable: {
			params: {
				positions: {
					type: "array",
					items: "object",
				},
			},
			cache: false,
			async handler(ctx) {
				const positions = ctx.params.positions as PortfolioPositionInput[]
				const bonds = await getOrBuildBondsData()

				return getPortfolioTable(positions, bonds)
			},
		},
	},
}

function parseFilters(rawFilters: unknown) {
	if (typeof rawFilters !== "string" || rawFilters === "") {
		return {}
	}

	try {
		const parsed = JSON.parse(rawFilters)
		return typeof parsed === "object" && parsed !== null ? parsed as Record<string, unknown> : {}
	} catch {
		return {}
	}
}
