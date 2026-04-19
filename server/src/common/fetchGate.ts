import { mkdir, rm, stat, utimes, writeFile } from "node:fs/promises"
import path from "node:path"
import { CACHE_BASE_PATH, FETCH_MARKER_FILE_NAME, FETCH_MARKER_TTL_MS } from "./cache"

const fetchMarkerPath = path.resolve(CACHE_BASE_PATH, FETCH_MARKER_FILE_NAME)

export async function shouldStartFetch(now = Date.now()) {
	try {
		const markerStats = await stat(fetchMarkerPath)
		return now - markerStats.mtimeMs >= FETCH_MARKER_TTL_MS
	} catch (error) {
		if (isMissingFileError(error)) {
			return true
		}

		throw error
	}
}

export async function markFetchStarted(now = new Date()) {
	await mkdir(CACHE_BASE_PATH, { recursive: true })

	try {
		await utimes(fetchMarkerPath, now, now)
	} catch (error) {
		if (!isMissingFileError(error)) {
			throw error
		}

		await writeFile(fetchMarkerPath, "", "utf8")
		await utimes(fetchMarkerPath, now, now)
	}
}

export async function clearFetchMarker() {
	try {
		await rm(fetchMarkerPath, { force: true })
	} catch (error) {
		if (!isMissingFileError(error)) {
			throw error
		}
	}
}

export function getFetchMarkerPath() {
	return fetchMarkerPath
}

function isMissingFileError(error: unknown) {
	return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT"
}
