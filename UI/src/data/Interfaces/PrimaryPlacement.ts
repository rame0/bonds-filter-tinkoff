import type { Bond } from "./BondsResoinse"

export interface PrimaryPlacement extends Omit<Bond, "nominal" | "initialNominal" | "placementPrice" | "aciValue"> {
	nominal?: number
	initialNominal?: number
	placementPrice?: number
	aciValue?: number
	isPrimaryCandidate: true
	primaryReason: string
	hasStartedTrading: boolean
	tradingStatusLabel: string
}
