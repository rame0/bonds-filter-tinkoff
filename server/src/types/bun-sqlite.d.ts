declare module "bun:sqlite" {
	export class Database {
		constructor(filename?: string, options?: { create?: boolean })
		run(query: string, params?: unknown[] | Record<string, unknown> | unknown): {
			changes: number
			lastInsertRowid: number
		}
		query<TRow = unknown, TParams extends unknown[] = unknown[]>(query: string): {
			get(...params: TParams): TRow | undefined
			run(...params: TParams): {
				changes: number
				lastInsertRowid: number
			}
		}
	}
}
