import { httpClient } from '@/plugins/axios'
//@ts-ignore
import { type CombinedBondsResponse } from '../../../server/src/common/innterfaces/CombinedBondsResponse'

export default class BondsRepository {
  $http = httpClient
  endpoint = 'bonds'

  public getEndpoint() {
    if (this.endpoint) return this.endpoint
  }

  async list(): Promise<CombinedBondsResponse[]> {
    return this.$http.get(`${this.getEndpoint()}/instruments`, {}).then((res) => res.data)
  }
}
