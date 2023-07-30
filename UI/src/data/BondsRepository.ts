import { httpClient } from '@/plugins/axios'
import { type CombinedBondsResponse } from '../../../server/src/common/CombinedBondsResponse'

export default class BondsRepository {
  $http = httpClient
  endpoint = 'bonds'

  public getEndpoint() {
    if (this.endpoint) return this.endpoint
  }

  async list(): Promise<CombinedBondsResponse[]> {
    return this.$http
      .get(`${this.getEndpoint()}/instruments`, {})
      .then((res) => res.data)
  }
}
