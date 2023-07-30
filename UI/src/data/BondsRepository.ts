import { httpClient } from '@/plugins/axios'
import type { BondsResponse } from './Interfaces/BondsResoinse'

export default class BondsRepository {
  $http = httpClient
  endpoint = 'bonds'

  public getEndpoint() {
    if (this.endpoint) return this.endpoint
  }

  async list(): Promise<BondsResponse[]> {
    return this.$http
      .get(`${this.getEndpoint()}/instruments`, {})
      .then((res) => res.data.instruments)
  }
}
