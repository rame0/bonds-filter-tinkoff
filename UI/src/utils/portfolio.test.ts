import { describe, expect, test } from "bun:test"
import { formatDateTime, formatInteger, formatMoney, formatPercent } from "./format"

describe("portfolio formatters", () => {
	test("formats integer values without fraction digits", () => {
		expect(formatInteger(1234)).toBe("1 234")
	})

	test("formats money values with two fraction digits and currency", () => {
		expect(formatMoney(1234.5)).toBe("1 234,50 RUB")
	})

	test("formats percent values with two fraction digits", () => {
		expect(formatPercent(12.345)).toBe("12,35%")
	})

	test("formats date time using ru locale", () => {
		expect(formatDateTime("2026-04-20T05:00:00.000Z")).toContain("20.04.2026")
	})
})
