import { describe, expect, mock, test } from "bun:test"

const investJsCtor = mock((options: unknown) => options)

class InvestJsClientMock {
	constructor(options: unknown) {
		investJsCtor(options)
		return { kind: "invest-js", options }
	}
}

mock.module("@tinkoff/invest-js", () => ({
	TTechApiClient: InvestJsClientMock,
}))

const createApi = await import("./createInvestApi")

describe("createInvestApi", () => {
	test("creates invest-js client", () => {
		investJsCtor.mockReset()

		const api = createApi.createInvestApi({ TINKOFF_API_TOKEN: "token" }) as any

		expect(api.kind).toBe("invest-js")
		expect(investJsCtor).toHaveBeenCalledWith({
			token: "token",
			metadata: {
				"x-app-name": createApi.APP_NAME,
			},
		})
	})

	test("throws when token is missing", () => {
		expect(() => createApi.createInvestApi({})).toThrow("[api] TINKOFF_API_TOKEN is not set")
	})
})
