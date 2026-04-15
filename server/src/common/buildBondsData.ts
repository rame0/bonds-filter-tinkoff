import moment from "moment/moment"
import { getMoexData } from "./getMoexData"
import { CombinedBondsResponse } from "./interfaces/CombinedBondsResponse"
import { listBonds, getLastPrices } from "./investApiFacade"
import { isMoneyLike, toNumber } from "./utils/money"
import { roundTo } from "./utils/round"

export async function buildBondsData(): Promise<CombinedBondsResponse[]> {
  const bonds = await listBonds()

  const instrumentIDs: string[] = bonds.map(instrument => instrument.uid)
  const tickers = bonds.map(instrument => instrument.ticker)
  const prices = await getLastPrices(instrumentIDs)

  const moexBonds = await getMoexData(tickers)
  const lastPriceByFigi = new Map(prices.map(item => [item.figi, item.price]))

  const response: CombinedBondsResponse[] = []
  const now = moment()
  for (const t1 of bonds) {
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
