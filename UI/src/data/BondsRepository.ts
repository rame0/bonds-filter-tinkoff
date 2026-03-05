import { httpClient } from '@/plugins/axios'
//@ts-ignore
import { type CombinedBondsResponse } from '@/external/interfaces/CombinedBondsResponse'
import type { CombinedCoupon } from "@/external/interfaces/CombinedCoupon"

export default class BondsRepository {
  $http = httpClient
  endpoint = 'bonds'

  public getEndpoint() {
    if (this.endpoint) return this.endpoint
  }

  async list(): Promise<CombinedBondsResponse[]> {
    return this.$http.get(`${this.getEndpoint()}/instruments`, {}).then((res) => res.data)
  }

  async coupons(id: string): Promise<CombinedCoupon[]> {
    return this.$http.get(`${this.getEndpoint()}/coupons`, { params: { id } }).then((res) => res.data  as CombinedCoupon[])
  }
}
