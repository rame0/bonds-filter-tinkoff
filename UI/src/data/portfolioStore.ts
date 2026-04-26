import { defineStore } from "pinia"
import { useStorage } from "@vueuse/core"
import type { CombinedBondsResponse } from "@/data/Interfaces/CombinedBondsResponse"
import type { PortfolioPositionInput } from "@/data/Interfaces/PortfolioMetrics"

export interface PortfolioPositionStored {
	uid: string
	qty: number
}

type LegacyPortfolioPosition = CombinedBondsResponse | PortfolioPositionStored

export interface PortfolioBondsStore {
	[key: string]: LegacyPortfolioPosition
}

export interface SavedPortfolio {
	id: string
	name: string
	bonds: Record<string, PortfolioPositionStored>
	createdAt: string
	updatedAt: string
}

export interface PortfolioStorageState {
	activePortfolioId: string
	portfolios: Record<string, SavedPortfolio>
}

const PORTFOLIO_STORAGE_KEY = "portfolio-storage"
const LEGACY_BONDS_STORAGE_KEY = "bonds"
const DEFAULT_PORTFOLIO_NAME = "Мой портфель"

export const usePortfolioStore = defineStore("portfolio", {
	state: () => ({
		storage: useStorage(PORTFOLIO_STORAGE_KEY, createDefaultPortfolioState())
	}),
	getters: {
		activePortfolio(): SavedPortfolio {
			return getActivePortfolio(this.storage)
		},
		activePortfolioId(): string {
			return getActivePortfolio(this.storage).id
		},
		portfolios(): SavedPortfolio[] {
			return Object.values(this.storage.portfolios).sort((left, right) => left.createdAt.localeCompare(right.createdAt))
		},
		bondsQty(): number {
			let qty = 0
			for (const bondId in this.activePortfolio.bonds) {
				qty += this.activePortfolio.bonds[bondId].qty
			}
			return qty
		},
		positions(): PortfolioPositionInput[] {
			const bonds: PortfolioPositionInput[] = []
			for (const bondId in this.activePortfolio.bonds) {
				const position = normalizePortfolioPosition(this.activePortfolio.bonds[bondId], bondId)
				if (position.qty > 0) {
					bonds.push(position)
				}
			}
			return bonds
		},
		isEmpty(): boolean {
			return Object.keys(this.activePortfolio.bonds).length < 1
		},
		canDeletePortfolios(): boolean {
			return Object.keys(this.storage.portfolios).length > 1
		}
	},
	actions: {
		ensureMigrated() {
			const persistedStorage = readStorageValue(PORTFOLIO_STORAGE_KEY)
			const legacyBonds = readLegacyPortfolioStore()
			const result = migratePortfolioStorage(persistedStorage ?? (legacyBonds ? null : this.storage), legacyBonds)
			this.storage = result.state

			if (result.consumeLegacy && canUseLocalStorage()) {
				window.localStorage.removeItem(LEGACY_BONDS_STORAGE_KEY)
			}
		},
		createPortfolio(name?: string) {
			const id = createPortfolioId()
			const portfolio = createEmptyPortfolio(id, getPortfolioName(name, this.portfolios.length + 1))
			this.storage.portfolios[id] = portfolio
			this.storage.activePortfolioId = id
		},
		switchPortfolio(id: string) {
			if (this.storage.portfolios[id]) {
				this.storage.activePortfolioId = id
			}
		},
		renamePortfolio(id: string, name: string) {
			const portfolio = this.storage.portfolios[id]
			if (!portfolio) {
				return
			}

			portfolio.name = getPortfolioName(name, 0, portfolio.name)
			portfolio.updatedAt = createTimestamp()
		},
		duplicatePortfolio(id: string) {
			const portfolio = this.storage.portfolios[id]
			if (!portfolio) {
				return
			}

			const nextId = createPortfolioId()
			const timestamp = createTimestamp()
			this.storage.portfolios[nextId] = {
				id: nextId,
				name: `${portfolio.name} (копия)`,
				bonds: clonePortfolioBonds(portfolio.bonds),
				createdAt: timestamp,
				updatedAt: timestamp
			}
			this.storage.activePortfolioId = nextId
		},
		deletePortfolio(id: string) {
			if (!this.storage.portfolios[id] || Object.keys(this.storage.portfolios).length < 2) {
				return false
			}

			delete this.storage.portfolios[id]
			if (this.storage.activePortfolioId === id) {
				this.storage.activePortfolioId = Object.keys(this.storage.portfolios)[0]
			}

			return true
		},
		increaseQty(bond: Pick<CombinedBondsResponse, "uid"> | string) {
			const uid = typeof bond === "string" ? bond : bond.uid
			const activePortfolio = getActivePortfolio(this.storage)
			if (activePortfolio.bonds[uid]) {
				activePortfolio.bonds[uid] = {
					uid,
					qty: normalizePortfolioPosition(activePortfolio.bonds[uid], uid).qty + 1
				}
			} else {
				activePortfolio.bonds[uid] = { uid, qty: 1 }
			}

			activePortfolio.updatedAt = createTimestamp()
		},
		decreaseQty(bondId: string) {
			const activePortfolio = getActivePortfolio(this.storage)
			if (!activePortfolio.bonds[bondId]) {
				return
			}

			const nextQty = normalizePortfolioPosition(activePortfolio.bonds[bondId], bondId).qty - 1
			if (nextQty < 1) {
				this.dropBond(bondId)
				return
			}

			activePortfolio.bonds[bondId] = { uid: bondId, qty: nextQty }
			activePortfolio.updatedAt = createTimestamp()
		},
		setQty(bondId: string, qty: number) {
			const nextQty = Math.max(0, Math.trunc(Number(qty)))
			if (nextQty < 1) {
				this.dropBond(bondId)
				return
			}

			const activePortfolio = getActivePortfolio(this.storage)
			activePortfolio.bonds[bondId] = { uid: bondId, qty: nextQty }
			activePortfolio.updatedAt = createTimestamp()
		},
		getBondQty(bondId: string): number {
			const activePortfolio = getActivePortfolio(this.storage)
			return activePortfolio.bonds[bondId] ? normalizePortfolioPosition(activePortfolio.bonds[bondId], bondId).qty : 0
		},
		dropBond(bondId: string) {
			const activePortfolio = getActivePortfolio(this.storage)
			if (!activePortfolio.bonds[bondId]) {
				return
			}

			delete activePortfolio.bonds[bondId]
			activePortfolio.updatedAt = createTimestamp()
		},
		dropAllBonds() {
			const activePortfolio = getActivePortfolio(this.storage)
			for (const bondId of Object.keys(activePortfolio.bonds)) {
				delete activePortfolio.bonds[bondId]
			}
			activePortfolio.updatedAt = createTimestamp()
		}
	}
})

export function createDefaultPortfolioState(): PortfolioStorageState {
	const id = createPortfolioId()
	return {
		activePortfolioId: id,
		portfolios: {
			[id]: createEmptyPortfolio(id, DEFAULT_PORTFOLIO_NAME)
		}
	}
}

export function createEmptyPortfolio(id: string, name: string): SavedPortfolio {
	const timestamp = createTimestamp()
	return {
		id,
		name,
		bonds: {},
		createdAt: timestamp,
		updatedAt: timestamp
	}
}

export function createPortfolioId(): string {
	return `portfolio-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function normalizePortfolioPosition(position: LegacyPortfolioPosition | undefined, bondId: string): PortfolioPositionStored {
	const qty = Math.max(0, Math.trunc(Number(position?.qty ?? 0)))
	const uid = typeof position?.uid === "string" && position.uid ? position.uid : bondId

	return { uid, qty }
}

export function normalizePortfolioBonds(raw: unknown): Record<string, PortfolioPositionStored> {
	if (!raw || typeof raw !== "object") {
		return {}
	}

	const normalized: Record<string, PortfolioPositionStored> = {}
	for (const bondId in raw as PortfolioBondsStore) {
		const position = normalizePortfolioPosition((raw as PortfolioBondsStore)[bondId], bondId)
		if (position.qty > 0) {
			normalized[position.uid] = position
		}
	}

	return normalized
}

export function migratePortfolioStorage(rawState: unknown, legacyBonds: unknown): {
	state: PortfolioStorageState
	consumeLegacy: boolean
} {
	const normalizedState = normalizePortfolioStorage(rawState)
	if (normalizedState) {
		return {
			state: normalizedState,
			consumeLegacy: false
		}
	}

	const legacyPositions = normalizePortfolioBonds(legacyBonds)
	if (Object.keys(legacyPositions).length < 1) {
		return {
			state: createDefaultPortfolioState(),
			consumeLegacy: false
		}
	}

	const id = createPortfolioId()
	const portfolio = createEmptyPortfolio(id, DEFAULT_PORTFOLIO_NAME)
	portfolio.bonds = legacyPositions
	portfolio.updatedAt = createTimestamp()

	return {
		state: {
			activePortfolioId: id,
			portfolios: {
				[id]: portfolio
			}
		},
		consumeLegacy: true
	}
}

export function normalizePortfolioStorage(rawState: unknown): PortfolioStorageState | null {
	if (!rawState || typeof rawState !== "object") {
		return null
	}

	const candidate = rawState as Partial<PortfolioStorageState>
	if (!candidate.portfolios || typeof candidate.portfolios !== "object") {
		return null
	}

	const normalizedPortfolios: Record<string, SavedPortfolio> = {}
	for (const portfolioId in candidate.portfolios) {
		const normalized = normalizeSavedPortfolio(candidate.portfolios[portfolioId], portfolioId)
		if (normalized) {
			normalizedPortfolios[portfolioId] = normalized
		}
	}

	const portfolioIds = Object.keys(normalizedPortfolios)
	if (portfolioIds.length < 1) {
		return createDefaultPortfolioState()
	}

	const activePortfolioId =
		typeof candidate.activePortfolioId === "string" && normalizedPortfolios[candidate.activePortfolioId]
			? candidate.activePortfolioId
			: portfolioIds[0]

	return {
		activePortfolioId,
		portfolios: normalizedPortfolios
	}
}

export function getActivePortfolio(state: PortfolioStorageState): SavedPortfolio {
	const activePortfolio = state.portfolios[state.activePortfolioId]
	if (activePortfolio) {
		return activePortfolio
	}

	const fallbackId = Object.keys(state.portfolios)[0]
	if (fallbackId) {
		state.activePortfolioId = fallbackId
		return state.portfolios[fallbackId]
	}

	const defaultState = createDefaultPortfolioState()
	state.activePortfolioId = defaultState.activePortfolioId
	state.portfolios = defaultState.portfolios
	return state.portfolios[state.activePortfolioId]
}

function normalizeSavedPortfolio(rawPortfolio: unknown, fallbackId: string): SavedPortfolio | null {
	if (!rawPortfolio || typeof rawPortfolio !== "object") {
		return null
	}

	const portfolio = rawPortfolio as Partial<SavedPortfolio>
	const id = typeof portfolio.id === "string" && portfolio.id ? portfolio.id : fallbackId
	const defaultPortfolio = createEmptyPortfolio(id, DEFAULT_PORTFOLIO_NAME)

	return {
		id,
		name: getPortfolioName(portfolio.name, 0, defaultPortfolio.name),
		bonds: normalizePortfolioBonds(portfolio.bonds),
		createdAt: normalizeTimestamp(portfolio.createdAt, defaultPortfolio.createdAt),
		updatedAt: normalizeTimestamp(portfolio.updatedAt, defaultPortfolio.updatedAt)
	}
}

function normalizeTimestamp(value: unknown, fallback: string): string {
	if (typeof value !== "string") {
		return fallback
	}

	const date = new Date(value)
	return Number.isNaN(date.getTime()) ? fallback : date.toISOString()
}

function clonePortfolioBonds(bonds: Record<string, PortfolioPositionStored>): Record<string, PortfolioPositionStored> {
	const clone: Record<string, PortfolioPositionStored> = {}
	for (const bondId in bonds) {
		clone[bondId] = { ...bonds[bondId] }
	}
	return clone
}

function getPortfolioName(name: unknown, index: number, fallback = ""): string {
	if (typeof name === "string" && name.trim()) {
		return name.trim().slice(0, 60)
	}

	if (fallback) {
		return fallback
	}

	return index < 1 ? DEFAULT_PORTFOLIO_NAME : `Портфель ${index}`
}

function createTimestamp(): string {
	return new Date().toISOString()
}

function readLegacyPortfolioStore(): unknown {
	return readStorageValue(LEGACY_BONDS_STORAGE_KEY)
}

function readStorageValue(key: string): unknown {
	if (!canUseLocalStorage()) {
		return null
	}

	const raw = window.localStorage.getItem(key)
	if (!raw) {
		return null
	}

	try {
		return JSON.parse(raw)
	} catch {
		return null
	}
}

function canUseLocalStorage(): boolean {
	return typeof window !== "undefined" && typeof window.localStorage !== "undefined"
}

export const portfolioStore = () => {
	const store = usePortfolioStore()
	store.ensureMigrated()
	return store
}
