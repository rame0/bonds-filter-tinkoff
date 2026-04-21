import { httpClient } from '@/plugins/axios'
import type { CombinedBondsResponse } from '@/data/Interfaces/CombinedBondsResponse'
import type { CombinedCoupon } from "@/data/Interfaces/CombinedCoupon"
import type { BondsDataStatus } from "@/data/Interfaces/BondsDataStatus"
import type { PortfolioMetricsResponse, PortfolioPositionInput } from "@/data/Interfaces/PortfolioMetrics"
import type { PortfolioTableResponse } from "@/data/Interfaces/PortfolioTable"

export default class BondsRepository {
  $http = httpClient
  endpoint = 'bonds'

  public getEndpoint() {
    if (this.endpoint) return this.endpoint
  }

  async list(): Promise<CombinedBondsResponse[]> {
    return this.$http.get(`${this.getEndpoint()}/instruments`, {}).then((res) => res.data)
  }

  async status(): Promise<BondsDataStatus> {
    return this.$http.get(`${this.getEndpoint()}/status`, {}).then((res) => res.data as BondsDataStatus)
  }

  async coupons(id: string): Promise<CombinedCoupon[]> {
    return this.$http.get(`${this.getEndpoint()}/coupons`, { params: { id } }).then((res) => res.data  as CombinedCoupon[])
  }

  async portfolioMetrics(positions: PortfolioPositionInput[]): Promise<PortfolioMetricsResponse> {
    return this.$http.post(`${this.getEndpoint()}/portfolioMetrics`, { positions }).then((res) => res.data as PortfolioMetricsResponse)
  }

  async portfolioTable(positions: PortfolioPositionInput[]): Promise<PortfolioTableResponse> {
    return this.$http.post(`${this.getEndpoint()}/portfolioTable`, { positions }).then((res) => res.data as PortfolioTableResponse)
  }
}
