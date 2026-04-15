import { httpClient } from '@/plugins/axios'
import type { CombinedBondsResponse } from '@/data/Interfaces/CombinedBondsResponse'
import type { CombinedCoupon } from "@/data/Interfaces/CombinedCoupon"
import type { BondsDataStatus } from "@/data/Interfaces/BondsDataStatus"

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
}
