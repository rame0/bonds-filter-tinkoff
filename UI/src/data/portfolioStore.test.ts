import { beforeEach, describe, expect, test } from "bun:test"
import { createPinia, setActivePinia } from "pinia"
import {
	createDefaultPortfolioState,
	migratePortfolioStorage,
	normalizePortfolioBonds,
	portfolioStore,
	usePortfolioStore,
	type PortfolioStorageState
} from "./portfolioStore"

type StorageMock = {
	clear(): void
	getItem(key: string): string | null
	removeItem(key: string): void
	setItem(key: string, value: string): void
}

const createLocalStorageMock = (): StorageMock => {
	const storage = new Map<string, string>()

	return {
		clear() {
			storage.clear()
		},
		getItem(key) {
			return storage.has(key) ? storage.get(key) ?? null : null
		},
		removeItem(key) {
			storage.delete(key)
		},
		setItem(key, value) {
			storage.set(key, String(value))
		}
	}
}

describe("portfolio store", () => {
	beforeEach(() => {
		;(globalThis as typeof globalThis & {
			window: { localStorage: StorageMock }
		}).window = {
			localStorage: createLocalStorageMock()
		}

		window.localStorage.clear()
		setActivePinia(createPinia())
	})

	test("migrates legacy bonds storage into a default saved portfolio", () => {
		const migration = migratePortfolioStorage(null, {
			bondA: { uid: "bondA", qty: 2 },
			bondB: { uid: "bondB", qty: 0 }
		})

		expect(migration.consumeLegacy).toBe(true)
		expect(migration.state.activePortfolioId).toBeTruthy()
		expect(Object.keys(migration.state.portfolios)).toHaveLength(1)

		const activePortfolio = migration.state.portfolios[migration.state.activePortfolioId]
		expect(activePortfolio.name).toBe("Мой портфель")
		expect(activePortfolio.bonds).toEqual({
			bondA: { uid: "bondA", qty: 2 }
		})
	})

	test("keeps new storage format and normalizes invalid entries", () => {
		const rawState = {
			activePortfolioId: "second",
			portfolios: {
				first: {
					id: "first",
					name: "  Первый  ",
					bonds: {
						bondA: { qty: 3 }
					}
				},
				second: {
					id: "second",
					name: "",
					bonds: {
						bondB: { uid: "bondB", qty: 1 },
						bondC: { uid: "bondC", qty: -1 }
					}
				}
			}
		}

		const migration = migratePortfolioStorage(rawState, {
			legacy: { uid: "legacy", qty: 10 }
		})

		expect(migration.consumeLegacy).toBe(false)
		expect(migration.state.activePortfolioId).toBe("second")
		expect(migration.state.portfolios.first.name).toBe("Первый")
		expect(migration.state.portfolios.first.bonds).toEqual({
			bondA: { uid: "bondA", qty: 3 }
		})
		expect(migration.state.portfolios.second.bonds).toEqual({
			bondB: { uid: "bondB", qty: 1 }
		})
	})

	test("creates a default portfolio when storage is empty", () => {
		const state = createDefaultPortfolioState()

		expect(Object.keys(state.portfolios)).toHaveLength(1)
		expect(state.portfolios[state.activePortfolioId].name).toBe("Мой портфель")
		expect(state.portfolios[state.activePortfolioId].bonds).toEqual({})
	})

	test("keeps active portfolio positions isolated when switching", () => {
		const store = usePortfolioStore()
		store.storage = createDefaultPortfolioState() as PortfolioStorageState

		const firstId = store.activePortfolioId
		store.increaseQty("bondA")
		store.createPortfolio("Второй")
		const secondId = store.activePortfolioId

		store.increaseQty("bondB")
		expect(store.positions).toEqual([{ uid: "bondB", qty: 1 }])

		store.switchPortfolio(firstId)
		expect(store.positions).toEqual([{ uid: "bondA", qty: 1 }])

		store.switchPortfolio(secondId)
		expect(store.positions).toEqual([{ uid: "bondB", qty: 1 }])
	})

	test("duplicates and deletes portfolios safely", () => {
		const store = usePortfolioStore()
		store.storage = createDefaultPortfolioState() as PortfolioStorageState
		store.increaseQty("bondA")

		const sourceId = store.activePortfolioId
		store.duplicatePortfolio(sourceId)

		expect(store.portfolios).toHaveLength(2)
		expect(store.positions).toEqual([{ uid: "bondA", qty: 1 }])

		const duplicateId = store.activePortfolioId
		expect(duplicateId).not.toBe(sourceId)

		store.deletePortfolio(duplicateId)
		expect(store.portfolios).toHaveLength(1)
		expect(store.activePortfolioId).toBe(sourceId)
		expect(store.deletePortfolio(sourceId)).toBe(false)
	})

	test("normalizes legacy bond maps and drops zero quantities", () => {
		expect(normalizePortfolioBonds({
			bondA: { uid: "bondA", qty: 2 },
			bondB: { uid: "bondB", qty: 0 },
			bondC: { qty: 4 }
		})).toEqual({
			bondA: { uid: "bondA", qty: 2 },
			bondC: { uid: "bondC", qty: 4 }
		})
	})

	test("consumes legacy localStorage on store bootstrap", () => {
		window.localStorage.setItem("bonds", JSON.stringify({
			bondA: { uid: "bondA", qty: 2 }
		}))

		const store = portfolioStore()

		expect(store.positions).toEqual([{ uid: "bondA", qty: 2 }])
		expect(window.localStorage.getItem("bonds")).toBeNull()
	})
})
