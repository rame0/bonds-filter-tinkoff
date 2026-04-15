import { httpClient } from "@/plugins/axios"
import type { BondsDataStatus } from "@/data/Interfaces/BondsDataStatus"
import type { PrimaryPlacement } from "@/data/Interfaces/PrimaryPlacement"

export default class PrimaryRepository {
	$http = httpClient
	endpoint = "primary"

	async list(): Promise<PrimaryPlacement[]> {
		return this.$http.get(`${this.endpoint}/instruments`).then((res) => res.data as PrimaryPlacement[])
	}

	async status(): Promise<BondsDataStatus> {
		return this.$http.get(`${this.endpoint}/status`).then((res) => res.data as BondsDataStatus)
	}
}
