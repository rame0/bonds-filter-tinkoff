/// <reference types="vite/client" />

interface YandexMetrikaFunction {
	(id: string, action: string, options?: Record<string, unknown>): void
	a?: IArguments[]
	l?: number
}

interface Window {
	ym?: YandexMetrikaFunction
}
