export interface BondsDataStatus {
	isBuilding: boolean
	hasCachedData: boolean
	lastBuildStartedAt?: string
	lastBuildCompletedAt?: string
	message?: string
}
