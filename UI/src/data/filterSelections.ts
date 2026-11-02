import { DefaultFilterSelections, type FilterOptions, type FromTo } from "@/data/Types/FilterOptions"

// Прежнее значение по умолчанию: границы цены по ошибке попали в доходность и отсекали весь список
const LEGACY_DEFAULT_BOND_YIELD: FromTo = { from: 90, to: 110 }

const isLegacyDefaultBondYield = (value: Partial<FromTo> | undefined) =>
	value?.from === LEGACY_DEFAULT_BOND_YIELD.from && value?.to === LEGACY_DEFAULT_BOND_YIELD.to

export const createFilterSelections = (storedFilters: Partial<FilterOptions> | undefined): FilterOptions => ({
	...DefaultFilterSelections,
	...storedFilters,
	nominal: {
		...DefaultFilterSelections.nominal,
		...storedFilters?.nominal,
	},
	price: {
		...DefaultFilterSelections.price,
		...storedFilters?.price,
	},
	bondYield: {
		...DefaultFilterSelections.bondYield,
		...(isLegacyDefaultBondYield(storedFilters?.bondYield) ? {} : storedFilters?.bondYield),
	},
	duration: {
		...DefaultFilterSelections.duration,
		...storedFilters?.duration,
	},
})
