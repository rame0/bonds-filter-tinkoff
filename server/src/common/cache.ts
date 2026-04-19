import Cache from "file-system-cache"

export const CACHE_BASE_PATH = ".cache"
export const FETCH_MARKER_FILE_NAME = ".updated"
export const FETCH_MARKER_TTL_MS = 4 * 60 * 60 * 1000

export function createCache(options: Record<string, unknown> = {}) {
	return Cache({
		basePath: CACHE_BASE_PATH,
		...options,
	})
}
