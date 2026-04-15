import { TinkoffInvestApi } from "@psqq/tinkoff-invest-api"
import { TTechApiClient } from "@tinkoff/invest-js"
import type { InvestApi } from "../interfaces/InvestApi"

export const APP_NAME = "rame0/bonds-filter-tinkoff"

export type ApiDriver = "legacy" | "invest-js"

export function getRequiredToken(env: NodeJS.ProcessEnv = process.env) {
	const token = env.TINKOFF_API_TOKEN?.trim()
	if (!token) {
		throw new Error("[api] TINKOFF_API_TOKEN is not set")
	}

	return token
}

export function getApiDriver(env: NodeJS.ProcessEnv = process.env): ApiDriver {
	return env.TINKOFF_API_DRIVER === "invest-js" ? "invest-js" : "legacy"
}

export function createLegacyApi(token: string): InvestApi {
	return new TinkoffInvestApi({
		token,
		appName: APP_NAME,
	}) as unknown as InvestApi
}

export function createInvestJsApi(token: string): InvestApi {
	return new TTechApiClient({
		token,
		metadata: {
			"x-app-name": APP_NAME,
		},
	}) as unknown as InvestApi
}

export function createInvestApi(env: NodeJS.ProcessEnv = process.env): InvestApi {
	const token = getRequiredToken(env)
	return getApiDriver(env) === "invest-js" ? createInvestJsApi(token) : createLegacyApi(token)
}
