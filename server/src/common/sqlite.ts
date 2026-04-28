import { mkdirSync } from "node:fs"
import path from "node:path"
import { Database } from "bun:sqlite"

export const SQLITE_BASE_PATH = ".cache"
export const SQLITE_DB_FILE_NAME = "cache.sqlite"

const sqliteDirectory = path.resolve(SQLITE_BASE_PATH)
const sqliteDbPath = path.join(sqliteDirectory, SQLITE_DB_FILE_NAME)

mkdirSync(sqliteDirectory, { recursive: true })

const db = new Database(sqliteDbPath, { create: true })
let schemaEnsured = false

db.run("PRAGMA journal_mode = WAL;")
db.run("PRAGMA foreign_keys = ON;")

db.run(`
	CREATE TABLE IF NOT EXISTS cache_entries (
		key TEXT PRIMARY KEY,
		value TEXT NOT NULL,
		expires_at INTEGER,
		updated_at INTEGER NOT NULL
	)
`)

db.run(`
	CREATE TABLE IF NOT EXISTS bond_instruments (
		uid TEXT PRIMARY KEY,
		figi TEXT NOT NULL,
		ticker TEXT NOT NULL,
		isin TEXT,
		name TEXT NOT NULL,
		currency TEXT,
		nominal REAL,
		aci_value REAL,
		country_of_risk TEXT,
		sector TEXT,
		issue_kind TEXT,
		real_exchange TEXT,
		risk_level INTEGER,
		coupon_quantity_per_year INTEGER,
		indexed_nominal_flag INTEGER NOT NULL DEFAULT 0,
		collateral_flag INTEGER NOT NULL DEFAULT 0,
		tax_free_flag INTEGER NOT NULL DEFAULT 0,
		short_enabled_flag INTEGER NOT NULL DEFAULT 0,
		floating_coupon_flag INTEGER NOT NULL DEFAULT 0,
		amortization_flag INTEGER NOT NULL DEFAULT 0,
		perpetual_flag INTEGER NOT NULL DEFAULT 0,
		subordinated_flag INTEGER NOT NULL DEFAULT 0,
		buy_available_flag INTEGER NOT NULL DEFAULT 0,
		sell_available_flag INTEGER NOT NULL DEFAULT 0,
		api_trade_available_flag INTEGER NOT NULL DEFAULT 0,
		for_iis_flag INTEGER NOT NULL DEFAULT 0,
		for_qual_investor_flag INTEGER NOT NULL DEFAULT 0,
		otc_flag INTEGER NOT NULL DEFAULT 0,
		weekend_flag INTEGER NOT NULL DEFAULT 0,
		blocked_tca_flag INTEGER NOT NULL DEFAULT 0,
		buyback_date TEXT,
		maturity_date TEXT,
		class_code TEXT,
		source_updated_at TEXT,
		updated_at TEXT NOT NULL
	)
`)

db.run("CREATE INDEX IF NOT EXISTS idx_bond_instruments_ticker ON bond_instruments(ticker)")
db.run("CREATE INDEX IF NOT EXISTS idx_bond_instruments_figi ON bond_instruments(figi)")
db.run("CREATE INDEX IF NOT EXISTS idx_bond_instruments_isin ON bond_instruments(isin)")

ensureBondInstrumentColumns()

db.run(`
	CREATE TABLE IF NOT EXISTS bond_market_snapshot (
		uid TEXT PRIMARY KEY REFERENCES bond_instruments(uid) ON DELETE CASCADE,
		price_percent REAL,
		price_source TEXT,
		bond_yield_percent REAL,
		bond_yield_source TEXT,
		duration_months REAL,
		duration_source TEXT,
		market_currency TEXT,
		moex_board_id TEXT,
		source_updated_at TEXT,
		updated_at TEXT NOT NULL
	)
`)

db.run("CREATE INDEX IF NOT EXISTS idx_bond_market_snapshot_updated_at ON bond_market_snapshot(updated_at)")

db.run(`
	CREATE TABLE IF NOT EXISTS bond_liquidity_snapshot (
		uid TEXT PRIMARY KEY REFERENCES bond_instruments(uid) ON DELETE CASCADE,
		liquidity INTEGER,
		trade_days INTEGER,
		volume_sum REAL,
		window_from TEXT,
		window_to TEXT,
		liquidity_source TEXT,
		updated_at TEXT NOT NULL
	)
`)

db.run("CREATE INDEX IF NOT EXISTS idx_bond_liquidity_snapshot_updated_at ON bond_liquidity_snapshot(updated_at)")

db.run(`
	CREATE TABLE IF NOT EXISTS bond_coupon_events (
		event_key TEXT PRIMARY KEY,
		uid TEXT NOT NULL REFERENCES bond_instruments(uid) ON DELETE CASCADE,
		coupon_number INTEGER,
		event_date TEXT NOT NULL,
		event_type TEXT NOT NULL,
		coupon_value_native REAL,
		coupon_currency TEXT,
		coupon_value_rub REAL,
		coupon_percent REAL,
		principal_payment_native REAL,
		principal_payment_currency TEXT,
		principal_payment_rub REAL,
		remaining_principal_native REAL,
		remaining_principal_currency TEXT,
		is_floating INTEGER NOT NULL DEFAULT 0,
		is_amortizing INTEGER NOT NULL DEFAULT 0,
		is_perpetual INTEGER NOT NULL DEFAULT 0,
		is_known INTEGER NOT NULL DEFAULT 1,
		is_estimated INTEGER NOT NULL DEFAULT 0,
		estimation_method TEXT,
		source TEXT NOT NULL,
		source_priority INTEGER NOT NULL DEFAULT 0,
		raw_fingerprint TEXT,
		updated_at TEXT NOT NULL
	)
`)

db.run("CREATE INDEX IF NOT EXISTS idx_bond_coupon_events_uid_event_date ON bond_coupon_events(uid, event_date)")
db.run("CREATE INDEX IF NOT EXISTS idx_bond_coupon_events_uid_known_estimated ON bond_coupon_events(uid, is_known, is_estimated)")

db.run(`
	CREATE TABLE IF NOT EXISTS bond_coupon_months (
		uid TEXT NOT NULL REFERENCES bond_instruments(uid) ON DELETE CASCADE,
		month_index INTEGER NOT NULL,
		PRIMARY KEY (uid, month_index)
	)
`)

db.run("CREATE INDEX IF NOT EXISTS idx_bond_coupon_months_month_index ON bond_coupon_months(month_index)")

db.run(`
	CREATE TABLE IF NOT EXISTS bond_coupon_aggregates (
		uid TEXT PRIMARY KEY REFERENCES bond_instruments(uid) ON DELETE CASCADE,
		annual_coupon_sum_rub REAL,
		left_to_pay_rub REAL,
		left_coupon_count INTEGER NOT NULL DEFAULT 0,
		next_coupon_date TEXT,
		next_coupon_value_rub REAL,
		coupon_projection_quality TEXT NOT NULL DEFAULT "estimated",
		has_estimated_future_coupons INTEGER NOT NULL DEFAULT 0,
		has_amortization INTEGER NOT NULL DEFAULT 0,
		has_floating_coupons INTEGER NOT NULL DEFAULT 0,
		aggregate_source TEXT,
		computed_at TEXT NOT NULL
	)
`)

db.run(`
	CREATE TABLE IF NOT EXISTS bond_derived_metrics (
		uid TEXT PRIMARY KEY REFERENCES bond_instruments(uid) ON DELETE CASCADE,
		real_price_rub REAL,
		coupons_yield_rub_12m REAL,
		coupons_yield_source TEXT,
		bond_yield_percent_final REAL,
		bond_yield_final_source TEXT,
		duration_months_final REAL,
		duration_final_source TEXT,
		left_coupon_count INTEGER,
		left_to_pay_rub REAL,
		dirty_reason TEXT,
		computed_at TEXT NOT NULL
	)
`)

db.run(`
	CREATE TABLE IF NOT EXISTS bond_sync_state (
		uid TEXT PRIMARY KEY REFERENCES bond_instruments(uid) ON DELETE CASCADE,
		instrument_core_updated_at TEXT,
		market_snapshot_updated_at TEXT,
		coupon_events_updated_at TEXT,
		liquidity_snapshot_updated_at TEXT,
		derived_metrics_updated_at TEXT,
		coupon_events_expires_at TEXT,
		liquidity_expires_at TEXT,
		market_expires_at TEXT,
		needs_recompute INTEGER NOT NULL DEFAULT 1,
		needs_coupon_refresh INTEGER NOT NULL DEFAULT 1,
		needs_liquidity_refresh INTEGER NOT NULL DEFAULT 1,
		last_error TEXT,
		last_error_at TEXT
	)
`)

db.run("CREATE INDEX IF NOT EXISTS idx_bond_sync_state_needs_recompute ON bond_sync_state(needs_recompute)")
db.run("CREATE INDEX IF NOT EXISTS idx_bond_sync_state_needs_coupon_refresh ON bond_sync_state(needs_coupon_refresh)")
db.run("CREATE INDEX IF NOT EXISTS idx_bond_sync_state_needs_liquidity_refresh ON bond_sync_state(needs_liquidity_refresh)")

db.run(`
	CREATE TABLE IF NOT EXISTS sync_jobs (
		job_name TEXT PRIMARY KEY,
		started_at TEXT,
		finished_at TEXT,
		status TEXT NOT NULL,
		cursor TEXT,
		stats_json TEXT,
		error_text TEXT
	)
`)

export function getDatabase() {
	ensureSchema()
	return db
}

const BOND_TABLE_NAMES = [
	"bond_coupon_months",
	"bond_coupon_events",
	"bond_coupon_aggregates",
	"bond_derived_metrics",
	"bond_liquidity_snapshot",
	"bond_market_snapshot",
	"bond_sync_state",
	"sync_jobs",
	"bond_instruments",
] as const

export function clearBondDataTables() {
	for (const tableName of BOND_TABLE_NAMES) {
		db.run(`DELETE FROM ${tableName}`)
	}
}

function ensureColumnExists(tableName: string, columnName: string, columnDefinition: string) {
	const columns = db.query<{ name: string }>(`PRAGMA table_info(${tableName})`).all()
	if (columns.some(column => column.name === columnName)) {
		return
	}

	db.run(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`)
}

function ensureSchema() {
	if (schemaEnsured) {
		return
	}

	ensureBondInstrumentColumns()
	schemaEnsured = true
}

function ensureBondInstrumentColumns() {
	ensureColumnExists("bond_instruments", "indexed_nominal_flag", "INTEGER NOT NULL DEFAULT 0")
	ensureColumnExists("bond_instruments", "collateral_flag", "INTEGER NOT NULL DEFAULT 0")
	ensureColumnExists("bond_instruments", "tax_free_flag", "INTEGER NOT NULL DEFAULT 0")
	ensureColumnExists("bond_instruments", "short_enabled_flag", "INTEGER NOT NULL DEFAULT 0")
	ensureColumnExists("bond_instruments", "blocked_tca_flag", "INTEGER NOT NULL DEFAULT 0")
}
