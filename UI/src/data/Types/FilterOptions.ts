import ExchangeCollation from '@/data/collations/ExchangeCollation'
import RiskLevelCollation from '@/data/collations/RiskLevelCollation'
import SectorsCollation from '@/data/collations/SectorsCollation'
import IssueKindCollations from '@/data/collations/IssueKindCollations'
import type { CollationItem } from '@/data/collations/BaseCollations'
import CountryCollation from '@/data/collations/CountryCollation'
import CurrencyCollation from '@/data/collations/CurrencyCollation'
import LiquidityCollations from '@/data/collations/LiquidityCollations'

export type FromTo = { from: number; to: number }

export interface FilterOptions {
  nominal: FromTo
  price: FromTo
  yield: FromTo
  duration: FromTo
  // placementPrice: FromTo

  indexedNominalFlag: boolean | number
  collateralFlag: boolean | number
  taxFreeFlag: boolean | number
  shortEnabledFlag: boolean | number
  otcFlag: boolean | number
  buyAvailableFlag: boolean | number
  sellAvailableFlag: boolean | number
  floatingCouponFlag: boolean | number
  perpetualFlag: boolean | number
  amortizationFlag: boolean | number
  apiTradeAvailableFlag: boolean | number
  forIisFlag: boolean | number
  forQualInvestorFlag: boolean | number
  weekendFlag: boolean | number
  blockedTcaFlag: boolean | number
  subordinatedFlag: boolean | number

  classCode: number[]
  currency: string[]
  couponQuantityPerYear: number[]
  countryOfRisk: string[]
  sector: string[]
  issueKind: string[]

  realExchange: string[]
  riskLevel: number[]
  liquidity: number[]
}

export interface FilterValues {
  nominal: FromTo
  price: FromTo
  yield: FromTo
  duration: FromTo
  // placementPrice: FromTo
  realExchange: CollationItem[]
  riskLevel: CollationItem[]
  liquidity: CollationItem[]
  classCode: CollationItem[]
  currency: CollationItem[]
  couponQuantityPerYear: CollationItem[]
  countryOfRisk: CollationItem[]
  sector: CollationItem[]
  issueKind: CollationItem[]
}

export const defaultFilterValues: FilterValues = {
  nominal: { from: 0, to: 100000000 },
  price: { from: 0, to: 5000 },
  yield: { from: 0, to: 1000 },
  duration: { from: 0, to: 1000},
  // placementPrice: { from: 0, to: 100000000 },
  realExchange: ExchangeCollation.asArray(),
  riskLevel: RiskLevelCollation.asArray(),
  liquidity: LiquidityCollations.asArray(),
  classCode: [],
  currency: CurrencyCollation.asArray(),
  couponQuantityPerYear: [],
  countryOfRisk: CountryCollation.asArray(),
  sector: SectorsCollation.asArray(),
  issueKind: IssueKindCollations.asArray()
}

export const DefaultFilterSelections: FilterOptions = {
  nominal: { from: 500, to: 3000 },
  price: { from: 90, to: 110 },
  yield: { from: 90, to: 110 },
  duration: { from: 12, to: 150 },
  // placementPrice: { from: 500, to: 3000 },

  indexedNominalFlag: -1,
  collateralFlag: -1,
  taxFreeFlag: -1,
  shortEnabledFlag: -1,
  otcFlag: -1,
  buyAvailableFlag: -1,
  sellAvailableFlag: -1,
  floatingCouponFlag: -1,
  perpetualFlag: -1,
  amortizationFlag: -1,
  apiTradeAvailableFlag: -1,
  forIisFlag: -1,
  forQualInvestorFlag: -1,
  weekendFlag: -1,
  blockedTcaFlag: -1,
  subordinatedFlag: -1,

  classCode: [],
  currency: [],
  couponQuantityPerYear: [],
  countryOfRisk: [],
  sector: [],
  issueKind: [],

  realExchange: [],
  riskLevel: [],
  liquidity: []
}
