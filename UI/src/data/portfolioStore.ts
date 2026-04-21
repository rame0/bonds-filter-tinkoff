import { defineStore } from "pinia"
import { useStorage } from "@vueuse/core"
import type { CombinedBondsResponse } from "@/data/Interfaces/CombinedBondsResponse"
import type { PortfolioPositionInput } from "@/data/Interfaces/PortfolioMetrics"

export interface PortfolioPositionStored {
	uid: string
	qty: number
}

type LegacyPortfolioPosition = CombinedBondsResponse | PortfolioPositionStored

export interface PortfolioStore {
	[key: string]: LegacyPortfolioPosition
}

export const usePortfolioStore = defineStore("portfolio", {
	state: () => ({
		bonds: useStorage("bonds", {} as PortfolioStore)
	}),
	getters: {
		bondsQty(): number {
			let qty = 0
			for (const bondId in this.bonds) {
				qty += normalizePortfolioPosition(this.bonds[bondId], bondId).qty
			}
			return qty
		},
		positions(): PortfolioPositionInput[] {
			const bonds: PortfolioPositionInput[] = []
			for (const bondId in this.bonds) {
				const position = normalizePortfolioPosition(this.bonds[bondId], bondId)
				if (position.qty > 0) {
					bonds.push(position)
				}
			}
			return bonds
		},
		isEmpty(): boolean {
			return Object.keys(this.bonds).length < 1
		}
	},
	actions: {
		ensureMigrated() {
			const normalized: Record<string, PortfolioPositionStored> = {}
			for (const bondId in this.bonds) {
				const position = normalizePortfolioPosition(this.bonds[bondId], bondId)
				if (position.qty > 0) {
					normalized[position.uid] = position
				}
			}

			this.bonds = normalized
		},
		increaseQty(bond: Pick<CombinedBondsResponse, "uid"> | string) {
			const uid = typeof bond === "string" ? bond : bond.uid
			if (this.bonds[uid]) {
				this.bonds[uid] = {
					uid,
					qty: normalizePortfolioPosition(this.bonds[uid], uid).qty + 1
				}
			} else {
				this.bonds[uid] = { uid, qty: 1 }
			}
		},
		decreaseQty(bondId: string) {
			if (!this.bonds[bondId]) {
				return
			}

			const nextQty = normalizePortfolioPosition(this.bonds[bondId], bondId).qty - 1
			if (nextQty < 1) {
				this.dropBond(bondId)
				return
			}

			this.bonds[bondId] = { uid: bondId, qty: nextQty }
		},
		setQty(bondId: string, qty: number) {
			const nextQty = Math.max(0, Math.trunc(Number(qty)))

			if (nextQty < 1) {
				this.dropBond(bondId)
				return
			}

			this.bonds[bondId] = { uid: bondId, qty: nextQty }
		},
		getBondQty(bondId: string): number {
			return this.bonds[bondId] ? normalizePortfolioPosition(this.bonds[bondId], bondId).qty : 0
		},
		dropBond(bondId: string) {
			delete this.bonds[bondId]
		},
		dropAllBonds() {
			for (const bondId of Object.keys(this.bonds)) {
				delete this.bonds[bondId]
			}
		}
	}
})

function normalizePortfolioPosition(position: LegacyPortfolioPosition | undefined, bondId: string): PortfolioPositionStored {
	const qty = Math.max(0, Math.trunc(Number(position?.qty ?? 0)))
	const uid = typeof position?.uid === "string" && position.uid ? position.uid : bondId

	return { uid, qty }
}

export const portfolioStore = () => {
	const store = usePortfolioStore()
	store.ensureMigrated()
	return store
}
