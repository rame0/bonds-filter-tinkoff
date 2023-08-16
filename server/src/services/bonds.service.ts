"use strict"
import { TinkoffInvestApi } from "@psqq/tinkoff-invest-api"
import Cache from "file-system-cache"
import { CombinedBondsResponse } from "../common/innterfaces/CombinedBondsResponse"
import { buildBondsData } from "../common/buildBondsData"

module.exports = {
  name: "bonds",
  // adapter: new MongooseAdapter(process.env.MONGO_URI || "mongodb://localhost/moleculer-blog", { useNewUrlParser: true, useUnifiedTopology: true }),

  settings: {},

  actions: {
    instruments: {
      params: {},
      cache: true,
      async handler(ctx): Promise<CombinedBondsResponse[]> {
        const cache = Cache({ ttl: 60 * 60 * 4 })

        const cachedBonds = await cache.get("bonds")

        if (cachedBonds) {
          return cachedBonds
        }

        const response = await buildBondsData()
        await cache.set("bonds", response)
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
}
