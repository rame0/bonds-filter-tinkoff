import { spawn } from "node:child_process"
import { existsSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, resolve } from "node:path"

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const defaultDataSourcePath = resolve(projectRoot, "src/common/database/DataSource.ts")
const typeormCliPath = resolve(projectRoot, "node_modules/typeorm/cli.js")

const rawArgs = process.argv.slice(2)
const commandArgs = rawArgs.length > 0 ? [...rawArgs] : ["migration:show"]

const findFlagIndex = (args: string[]) => args.findIndex(arg => arg === "-d" || arg === "--dataSource")

const dataSourceFlagIndex = findFlagIndex(commandArgs)
const dataSourcePath =
	dataSourceFlagIndex >= 0 ? commandArgs[dataSourceFlagIndex + 1] : defaultDataSourcePath

if (dataSourceFlagIndex >= 0 && !dataSourcePath) {
	console.error("TypeORM data source path is missing after -d/--dataSource.")
	process.exit(1)
}

if (dataSourceFlagIndex < 0) {
	commandArgs.push("-d", defaultDataSourcePath)
}

if (!existsSync(typeormCliPath)) {
	console.error(`TypeORM CLI not found at ${typeormCliPath}. Run 'bun install' in server/.`)
	process.exit(1)
}

if (!existsSync(resolve(projectRoot, dataSourcePath))) {
	console.error(`TypeORM data source not found: ${dataSourcePath}`)
	console.error("Create src/common/database/DataSource.ts or pass -d/--dataSource with a valid path.")
	process.exit(1)
}

const processHandle = spawn("bun", [typeormCliPath, ...commandArgs], {
	cwd: projectRoot,
	stdio: "inherit",
	env: process.env,
})

processHandle.on("error", error => {
	console.error("Failed to launch TypeORM CLI with Bun.", error)
	process.exit(1)
})

processHandle.on("exit", code => {
	process.exit(code ?? 1)
})
