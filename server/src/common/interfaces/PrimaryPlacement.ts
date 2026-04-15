import type { ApiBond } from "./InvestApi"

export interface PrimaryPlacement extends Omit<ApiBond, "nominal" | "initialNominal" | "placementPrice" | "aciValue"> {
	[key: string]: unknown
	nominal?: number
	initialNominal?: number
	placementPrice?: number
	aciValue?: number
	isPrimaryCandidate: true
	primaryReason: string
	hasStartedTrading: boolean
	tradingStatusLabel: string
}
