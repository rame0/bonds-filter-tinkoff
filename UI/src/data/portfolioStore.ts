import { defineStore } from "pinia"
import { useStorage } from "@vueuse/core"
import { type CombinedBondsResponse } from "@/external/interfaces/CombinedBondsResponse"
import type { CombinedCoupon } from "@/external/interfaces/CombinedCoupon"

export interface PortfolioStore {
	[key: string]: CombinedBondsResponse
}

export const usePortfolioStore = defineStore("portfolio", {
	state: () => ({
		bonds: useStorage("bonds", {} as PortfolioStore)
	}),
	getters: {
		bondsQty(): number {
			let qty = 0
			for (const bondId in this.bonds) {
				qty += this.bonds[bondId].qty
			}
			return qty
		},
		values(): CombinedBondsResponse[] {
			const bonds: CombinedBondsResponse[] = []
			for (const bondId in this.bonds) {
				bonds.push(this.bonds[bondId])
			}
			return bonds
		},
		isEmpty(): boolean {
			return Object.keys(this.bonds).length < 1
		}
	},
	actions: {
		increaseQty(bond: CombinedBondsResponse) {
			if (this.bonds[bond.uid]) {
				this.bonds[bond.uid].qty += 1
			} else {
				this.bonds[bond.uid] = bond
				this.bonds[bond.uid].qty = 1
			}
		},
		decreaseQty(bondId: string) {
			if (this.bonds[bondId]) {
				this.bonds[bondId].qty -= 1
				if (this.bonds[bondId].qty < 1) {
					this.dropBond(bondId)
				}
			}
		},
		getBondQty(bondId: string): number {
			return this.bonds[bondId]?.qty || 0
		},
		setBondCoupons(bondId: string, coupons: CombinedCoupon[]) {
			if (this.bonds[bondId]) {
				this.bonds[bondId].coupons = coupons
			}
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

export const portfolioStore = () => usePortfolioStore()
