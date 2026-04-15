import moment from "moment/moment"
import { getMoexData } from "./getMoexData"
import { CombinedBondsResponse } from "./interfaces/CombinedBondsResponse"
import { InstrumentStatus, type LastPricesResponse } from "./interfaces/InvestApi"
import { api } from "./api"
import { isMoneyLike, toNumber } from "./utils/money"
import { roundTo } from "./utils/round"

export async function buildBondsData(): Promise<CombinedBondsResponse[]> {
  const bonds = await api.instruments.bonds({
    instrumentStatus: InstrumentStatus.INSTRUMENT_STATUS_BASE,
  })

  const instrumentIDs: string[] = bonds.instruments.map(instrument => instrument.uid)
  const tickers = bonds.instruments.map(instrument => instrument.ticker)
  const prices: LastPricesResponse = await api.marketdata.getLastPrices({
    figi: [],
    instrumentId: instrumentIDs,
  })

  const moexBonds = await getMoexData(tickers)
  const lastPriceByFigi = new Map(prices.lastPrices.map(item => [item.figi, item.price]))

  const response: CombinedBondsResponse[] = []
  const now = moment()
  for (const t1 of bonds.instruments) {
    const instrument: CombinedBondsResponse = {} as CombinedBondsResponse
    for (const key of Object.keys(t1)) {
      if (t1[key] === undefined) {
        instrument[key] = undefined
      } else if (isMoneyLike(t1[key])) {
        instrument[key] = toNumber(t1[key])
      } else {
        instrument[key] = t1[key]
      }
    }
    const lastPrice = lastPriceByFigi.get(t1.figi)
    instrument.price = roundTo(toNumber(lastPrice))
    instrument.couponsYield = moexBonds[t1.ticker]?.couponsYield !== undefined
      ? roundTo(moexBonds[t1.ticker].couponsYield)
      : undefined
    instrument.bondYield = moexBonds[t1.ticker]?.BondYield !== undefined
      ? roundTo(moexBonds[t1.ticker].BondYield)
      : undefined
    instrument.duration = moexBonds[t1.ticker]?.BondDuration !== undefined
      ? roundTo(moexBonds[t1.ticker].BondDuration)
      : undefined
    if (instrument.duration === undefined || instrument.duration <= 0) {
      const dateStr = instrument.buyBackDate ? instrument.buyBackDate : instrument.maturityDate || ""
      const date = moment(dateStr)

      instrument.duration = roundTo(date.diff(now, "days") / 30) || 0
    }
    instrument.liquidity = moexBonds[t1.ticker]?.liquidity

    response.push(instrument)
  }

  return response
}
