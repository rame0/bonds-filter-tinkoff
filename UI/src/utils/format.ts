const integerFormatter = new Intl.NumberFormat("ru-RU", {
	maximumFractionDigits: 0,
})

const moneyFormatter = new Intl.NumberFormat("ru-RU", {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
})

export function formatInteger(value?: number | null) {
	if (value === undefined || value === null || Number.isNaN(value)) {
		return "—"
	}

	return integerFormatter.format(value)
}

export function formatMoney(value?: number | null, currency = "RUB") {
	if (value === undefined || value === null || Number.isNaN(value)) {
		return "—"
	}

	return `${moneyFormatter.format(value)} ${currency}`
}

export function formatPercent(value?: number | null) {
	if (value === undefined || value === null || Number.isNaN(value)) {
		return "—"
	}

	return `${moneyFormatter.format(value)}%`
}

export function formatDateTime(value?: string) {
	if (!value) {
		return "—"
	}

	return new Date(value).toLocaleString("ru-RU")
}

export function formatDate(value?: string) {
	if (!value) {
		return "—"
	}

	return new Date(value).toLocaleDateString("ru-RU")
}
