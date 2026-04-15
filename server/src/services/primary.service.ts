import type { BondsDataStatus } from "../common/interfaces/BondsDataStatus"
import type { PrimaryPlacement } from "../common/interfaces/PrimaryPlacement"
import {
	ensurePrimaryPlacementsDataBuild,
	getOrBuildPrimaryPlacementsData,
	getPrimaryPlacementsDataStatus,
} from "../common/getOrBuildPrimaryPlacementsData"

export default {
	name: "primary",
	settings: {},
	actions: {
		status: {
			params: {},
			cache: true,
			async handler(): Promise<BondsDataStatus> {
				await ensurePrimaryPlacementsDataBuild()
				return getPrimaryPlacementsDataStatus()
			},
		},
		instruments: {
			params: {},
			cache: true,
			async handler(ctx): Promise<PrimaryPlacement[]> {
				try {
					return await getOrBuildPrimaryPlacementsData()
				} catch (err) {
					ctx.meta.$statusCode = 503
					console.error("[primary.instruments] Failed to build primary placements:", err)
					throw new Error("Failed to build primary placements")
				}
			},
		},
	},
}
