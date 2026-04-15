import type { MoneyLike } from "../interfaces/InvestApi"

export function isMoneyLike(value: unknown): value is MoneyLike {
	return typeof value === "object" && value !== null && "units" in value && "nano" in value
}

export function toNumber(value?: MoneyLike | null) {
	return value ? value.units + value.nano / 1000000000 : undefined
}
