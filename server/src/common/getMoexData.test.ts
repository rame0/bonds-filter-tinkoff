import { expect, test } from "bun:test"
import moment from "moment"
import { calculateCouponsYieldForYear, mapWithConcurrency } from "./getMoexData"

test("calculateCouponsYieldForYear sums only coupons within the next 12 months", () => {
	const nowDate = moment("2026-04-14")

	const coupons = [
		{ date: moment("2026-04-13"), value: 10 },
		{ date: moment("2026-06-01"), value: 15 },
		{ date: moment("2027-04-14"), value: 20 },
		{ date: moment("2027-04-15"), value: 25 },
	] as const

	expect(calculateCouponsYieldForYear([...coupons], nowDate)).toBe(35)
})

test("mapWithConcurrency processes all items", async () => {
	const items = [1, 2, 3, 4, 5]
	const seen = new Set<number>()

	await mapWithConcurrency(items, 2, async item => {
		seen.add(item)
	})

	expect([...seen].sort((a, b) => a - b)).toEqual(items)
})
