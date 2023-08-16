import { Helpers, TinkoffInvestApi } from "@psqq/tinkoff-invest-api"
import { InstrumentStatus } from "@psqq/tinkoff-invest-api/cjs/generated/instruments"
import { GetLastPricesResponse } from "@psqq/tinkoff-invest-api/cjs/generated/marketdata"
import { MoneyValue, Quotation } from "@psqq/tinkoff-invest-api/src/generated/common"
import moment from "moment/moment"
import { getMoexData } from "./getMoexData"
import { CombinedBondsResponse } from "./innterfaces/CombinedBondsResponse"

export async function buildBondsData(): Promise<CombinedBondsResponse[]> {
  const api = new TinkoffInvestApi({
    token: process.env.TINKOFF_API_TOKEN,
    appName: "rame0/bonds-filter-tinkoff",
  })

  const bonds = await api.instruments.bonds({
    instrumentStatus: InstrumentStatus.INSTRUMENT_STATUS_BASE,
  })

  const instrumentIDs: string[] = bonds.instruments.map(instrument => instrument.uid)
  const isins = bonds.instruments.map(instrument => instrument.isin)
  const tickers = bonds.instruments.map(instrument => instrument.ticker)
  const prices: GetLastPricesResponse = await api.marketdata.getLastPrices({
    figi: [],
    instrumentId: instrumentIDs,
  })

  const moexBonds = await getMoexData(tickers)

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
    instrument.couponsYield = moexBonds[t1.ticker]?.couponsYield
    instrument.bondYield = moexBonds[t1.ticker]?.BondYield
    instrument.duration = moexBonds[t1.ticker]?.BondDuration
    if (instrument.duration === undefined || instrument.duration <= 0) {
      const dateStr = instrument.buyBackDate ? instrument.buyBackDate : instrument.maturityDate || ""
      const date = moment(dateStr)

      instrument.duration = Math.round((date.diff(now, "days") / 30) * 100) / 100 || 0
    }
    instrument.liquidity = moexBonds[t1.ticker]?.liquidity

    response.push(instrument)
  }

  return response
}
