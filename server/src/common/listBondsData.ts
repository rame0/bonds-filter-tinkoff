import { getStoredBondFilterOptions, listStoredBondsData } from "./bondDataSnapshot"
import { BondFilterOptionsResponse, BondListQuery, BondListResponse } from "./interfaces/BondList"

export function listBondsData(query: BondListQuery = {}): BondListResponse {
	return listStoredBondsData(query)
}

export function getBondFilterOptions(): BondFilterOptionsResponse {
	return getStoredBondFilterOptions()
}
