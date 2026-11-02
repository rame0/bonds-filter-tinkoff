import { describe, expect, test } from "bun:test"
import { createFilterSelections } from "./filterSelections"
import { DefaultFilterSelections, defaultFilterValues } from "./Types/FilterOptions"

describe("filter selections", () => {
	test("default bond yield range covers all available values", () => {
		expect(DefaultFilterSelections.bondYield).toEqual(defaultFilterValues.bondYield)
	})

	test("uses defaults when nothing is stored", () => {
		expect(createFilterSelections(undefined)).toEqual(DefaultFilterSelections)
	})

	test("resets legacy default bond yield range from storage", () => {
		const selections = createFilterSelections({ bondYield: { from: 90, to: 110 } })

		expect(selections.bondYield).toEqual(DefaultFilterSelections.bondYield)
	})

	test("keeps user-defined bond yield range from storage", () => {
		const selections = createFilterSelections({ bondYield: { from: 15, to: 40 } })

		expect(selections.bondYield).toEqual({ from: 15, to: 40 })
	})

	test("keeps other stored ranges", () => {
		const selections = createFilterSelections({ price: { from: 90, to: 110 } })

		expect(selections.price).toEqual({ from: 90, to: 110 })
	})
})
