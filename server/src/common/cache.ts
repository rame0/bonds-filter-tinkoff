import { mkdirSync } from "node:fs"
import path from "node:path"
import { Database } from "bun:sqlite"

export const CACHE_BASE_PATH = ".cache"
export const CACHE_DB_FILE_NAME = "cache.sqlite"
export const FETCH_MARKER_TTL_MS = 4 * 60 * 60 * 1000

interface CacheEntryRow {
	value: string
	expires_at: number | null
}

interface CacheOptions {
	ttl?: number
}

const cacheDirectory = path.resolve(CACHE_BASE_PATH)
const cacheDbPath = path.join(cacheDirectory, CACHE_DB_FILE_NAME)

mkdirSync(cacheDirectory, { recursive: true })

const db = new Database(cacheDbPath, { create: true })
db.run("PRAGMA journal_mode = WAL;")
db.run(`
	CREATE TABLE IF NOT EXISTS cache_entries (
		key TEXT PRIMARY KEY,
		value TEXT NOT NULL,
		expires_at INTEGER,
		updated_at INTEGER NOT NULL
	)
`)

const selectEntryStatement = db.query<CacheEntryRow, [string]>(`
	SELECT value, expires_at
	FROM cache_entries
	WHERE key = ?1
`)

const upsertEntryStatement = db.query(`
	INSERT INTO cache_entries (key, value, expires_at, updated_at)
	VALUES (?1, ?2, ?3, ?4)
	ON CONFLICT(key) DO UPDATE SET
		value = excluded.value,
		expires_at = excluded.expires_at,
		updated_at = excluded.updated_at
`)

const deleteEntryStatement = db.query("DELETE FROM cache_entries WHERE key = ?1")
const clearEntriesStatement = db.query("DELETE FROM cache_entries")

export function createCache(options: CacheOptions = {}) {
	return {
		async get<T>(key: string): Promise<T | undefined> {
			return readCacheEntry<T>(key)
		},
		getSync<T>(key: string): T | undefined {
			return readCacheEntry<T>(key)
		},
		async set(key: string, value: unknown) {
			writeCacheEntry(key, value, options.ttl)
		},
		async delete(key: string) {
			deleteCacheEntry(key)
		},
	}
}

export function deleteCacheEntry(key: string) {
	deleteEntryStatement.run(key)
}

export function clearCacheEntries() {
	clearEntriesStatement.run()
}

function readCacheEntry<T>(key: string): T | undefined {
	const row = selectEntryStatement.get(key)
	if (!row) {
		return undefined
	}

	if (row.expires_at !== null && row.expires_at <= Date.now()) {
		deleteEntryStatement.run(key)
		return undefined
	}

	return JSON.parse(row.value) as T
}

function writeCacheEntry(key: string, value: unknown, ttlSeconds?: number) {
	const now = Date.now()
	const expiresAt = typeof ttlSeconds === "number" && ttlSeconds > 0
		? now + ttlSeconds * 1000
		: null

	upsertEntryStatement.run(key, JSON.stringify(value), expiresAt, now)
}
