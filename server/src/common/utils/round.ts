type RoundMode = "round" | "floor" | "ceil"

/**
 * Rounds a number to a fixed number of decimal digits.
 * Returns undefined for undefined/null/NaN/infinite values.
 */
export function roundTo(value: number | null | undefined, digits = 2, mode: RoundMode = "round") {
	if (value === undefined || value === null || !Number.isFinite(value)) {
		return undefined
	}

	const factor = 10 ** digits
	if (mode === "floor") {
		return Math.floor((value + Number.EPSILON) * factor) / factor
	}

	if (mode === "ceil") {
		return Math.ceil((value + Number.EPSILON) * factor) / factor
	}

	return Math.round((value + Number.EPSILON) * factor) / factor
}
