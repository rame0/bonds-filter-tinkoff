/// <reference types="vite/client" />

interface YandexMetrikaFunction {
	(id: string, action: string, options?: Record<string, unknown>): void
	a?: unknown[][]
	l?: number
}

interface Window {
	ym?: YandexMetrikaFunction
}
