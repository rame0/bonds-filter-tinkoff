import { expect, test } from "bun:test"
import { sleep } from "./sleep"

test("sleep resolves after the requested timeout", async () => {
	const startedAt = Date.now()

	await sleep(5)

	expect(Date.now() - startedAt).toBeGreaterThanOrEqual(5)
})
