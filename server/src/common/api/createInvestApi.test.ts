import { describe, expect, mock, test } from "bun:test"

const legacyCtor = mock((options: unknown) => options)
const investJsCtor = mock((options: unknown) => options)

class LegacyClientMock {
	constructor(options: unknown) {
		legacyCtor(options)
		return { kind: "legacy", options }
	}
}

class InvestJsClientMock {
	constructor(options: unknown) {
		investJsCtor(options)
		return { kind: "invest-js", options }
	}
}

mock.module("@psqq/tinkoff-invest-api", () => ({
	TinkoffInvestApi: LegacyClientMock,
}))

mock.module("@tinkoff/invest-js", () => ({
	TTechApiClient: InvestJsClientMock,
}))

const createApi = await import("./createInvestApi")

describe("createInvestApi", () => {
	test("defaults to invest-js driver", () => {
		legacyCtor.mockReset()
		investJsCtor.mockReset()

		const api = createApi.createInvestApi({ TINKOFF_API_TOKEN: "token" }) as any

		expect(api.kind).toBe("invest-js")
		expect(investJsCtor).toHaveBeenCalledWith({
			token: "token",
			metadata: {
				"x-app-name": createApi.APP_NAME,
			},
		})
		expect(legacyCtor).not.toHaveBeenCalled()
	})

	test("can switch back to legacy driver", () => {
		legacyCtor.mockReset()
		investJsCtor.mockReset()

		const api = createApi.createInvestApi({
			TINKOFF_API_TOKEN: "token",
			TINKOFF_API_DRIVER: "legacy",
		}) as any

		expect(api.kind).toBe("legacy")
		expect(legacyCtor).toHaveBeenCalledWith({
			token: "token",
			appName: createApi.APP_NAME,
		})
		expect(investJsCtor).not.toHaveBeenCalled()
	})

	test("throws when token is missing", () => {
		expect(() => createApi.createInvestApi({})).toThrow("[api] TINKOFF_API_TOKEN is not set")
	})
})
