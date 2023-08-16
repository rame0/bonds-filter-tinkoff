"use strict"
import Cache from "file-system-cache"
import { CombinedBondsResponse } from "../common/innterfaces/CombinedBondsResponse"

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

        return await cache.get("bonds", [])
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
