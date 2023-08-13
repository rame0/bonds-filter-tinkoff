"use strict"
import path from "path"
import { Helpers, TinkoffInvestApi } from "@psqq/tinkoff-invest-api"
import { InstrumentStatus, type BondsResponse } from "@psqq/tinkoff-invest-api/cjs/generated/instruments"
import { GetLastPricesResponse } from "@psqq/tinkoff-invest-api/cjs/generated/marketdata"
import { type MoneyValue, type Quotation } from "@psqq/tinkoff-invest-api/src/generated/common"
import axios, { AxiosInstance } from "axios"
import Cache from "file-system-cache"
import moment from "moment"
import { CombinedBondsResponse } from "../common/innterfaces/CombinedBondsResponse"
import { getMoexData } from "../common/getMoexData"

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

        const api: TinkoffInvestApi = this.api

        const bonds = await api.instruments.bonds({
          instrumentStatus: InstrumentStatus.INSTRUMENT_STATUS_BASE,
        })

        const instrumentIDs: string[] = bonds.instruments.map(instrument => instrument.uid)
        const isins = bonds.instruments.map(instrument => instrument.isin)
        const prices: GetLastPricesResponse = await api.marketdata.getLastPrices({
          figi: [],
          instrumentId: instrumentIDs,
        })

        this.logger.info("getMoexData")
        const moexBonds = await getMoexData(isins)

        const isMoney = (value: any): value is MoneyValue => value.hasOwnProperty("units") && value.hasOwnProperty("nano")
        const isQuote = (value: any): value is Quotation => value.hasOwnProperty("units") && value.hasOwnProperty("nano")

        const response: CombinedBondsResponse[] = []
        const now = moment()
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
          instrument.couponsYield = moexBonds[t1.isin]?.couponsYield
          instrument.bondYield = moexBonds[t1.isin]?.BondYield
          instrument.duration = moexBonds[t1.isin]?.BondDuration
          if (instrument.duration === undefined || instrument.duration <= 0) {
            const dateStr = instrument.buyBackDate ? instrument.buyBackDate : instrument.maturityDate || ""
            const date = moment(dateStr)

            instrument.duration = Math.round((date.diff(now, "days") / 30) * 100) / 100 || 0
          }
          instrument.liquidity = moexBonds[t1.isin]?.liquidity

          response.push(instrument)
        }

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

  created() {
    this.api = new TinkoffInvestApi({
      token: process.env.TINKOFF_API_TOKEN,
      appName: "rame0/bonds-filter-tinkoff",
    })

    this.httpClient = axios.create({})
  },
}
