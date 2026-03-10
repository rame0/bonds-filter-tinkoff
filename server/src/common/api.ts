import { TinkoffInvestApi } from "@psqq/tinkoff-invest-api"

const token = process.env.TINKOFF_API_TOKEN?.trim()
if (!token) {
	throw new Error("[api] TINKOFF_API_TOKEN is not set")
}

export const api = new TinkoffInvestApi({
	token,
	appName: "rame0/bonds-filter-tinkoff",
})
