import { createInvestApi } from "./api/createInvestApi"
import type { InvestApi } from "./interfaces/InvestApi"

let apiInstance: InvestApi | undefined

export function getApi() {
	if (!apiInstance) {
		apiInstance = createInvestApi()
	}

	return apiInstance
}

export function setApiForTests(api: InvestApi | undefined) {
	apiInstance = api
}
