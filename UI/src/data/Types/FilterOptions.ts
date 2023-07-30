export type FilterOptionsType = {
  nominal: { from: number; to: number }
  placementPrice: { from: number; to: number }

  indexedNominalFlag: boolean | undefined
  collateralFlag: boolean | undefined
  taxFreeFlag: boolean | undefined
  shortEnabledFlag: boolean | undefined
  otcFlag: boolean | undefined
  buyAvailableFlag: boolean | undefined
  sellAvailableFlag: boolean | undefined
  floatingCouponFlag: boolean | undefined
  perpetualFlag: boolean | undefined
  amortizationFlag: boolean | undefined
  apiTradeAvailableFlag: boolean | undefined
  forIisFlag: boolean | undefined
  forQualInvestorFlag: boolean | undefined
  weekendFlag: boolean | undefined
  blockedTcaFlag: boolean | undefined
  subordinatedFlag: boolean | undefined

  classCode: number[]
  currency: string[]
  couponQuantityPerYear: number[]
  countryOfRisk: string[]
  sector: string[]
  issueKind: string[]

  realExchange: string[]
  riskLevel: number[]
}
