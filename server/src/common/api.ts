import { TinkoffInvestApi } from "@psqq/tinkoff-invest-api"

const token = process.env.TINKOFF_API_TOKEN
if (!token) {
	console.warn("[api] TINKOFF_API_TOKEN is not set; Tinkoff API calls will fail.")
}

export const api = new TinkoffInvestApi({
	token,
	appName: "rame0/bonds-filter-tinkoff"
})
