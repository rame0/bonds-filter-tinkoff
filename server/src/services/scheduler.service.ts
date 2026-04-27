import Cron from "moleculer-cron"
import * as currencyRatesModule from "../common/getCurrencyRates"
import * as bondsDataModule from "../common/getOrBuildBondsData"
import { getErrorMessage } from "../common/utils/error"

let isDataGrabberRunning = false
let isCurrencyRatesRefreshRunning = false

async function runDataGrabber(reason: "tick" | "init") {
  if (isDataGrabberRunning) {
    console.warn(`[DataGrabber] skip ${reason}; previous job is still running`)
    return
  }

  isDataGrabberRunning = true
  try {
		await bondsDataModule.getOrBuildBondsData(true)
  } finally {
    isDataGrabberRunning = false
  }
}

async function runCurrencyRatesRefresh(reason: "tick" | "init") {
  if (isCurrencyRatesRefreshRunning) {
    console.warn(`[CurrencyRates] skip ${reason}; previous job is still running`)
    return
  }

  isCurrencyRatesRefreshRunning = true
  try {
		await currencyRatesModule.refreshCurrencyRates()
  } finally {
    isCurrencyRatesRefreshRunning = false
  }
}

export default {
  name: "cron-job",

  mixins: [Cron],

  crons: [
    {
      name: "DataGrabber",
      cronTime: "0 */4 * * *",
      onTick: async () => {
        try {
          await runDataGrabber("tick")
		} catch (err) {
			console.error("[DataGrabber] onTick failed:", getErrorMessage(err))
		}
      },
      runOnInit: async () => {
		const data = await bondsDataModule.getCachedBondsData()
        if (!data) {
          try {
            await runDataGrabber("init")
			} catch (err) {
				console.error("[DataGrabber] runOnInit failed:", getErrorMessage(err))
			}
        }
      },
      timeZone: "GMT",
    },
    {
      name: "CurrencyRatesRefresh",
      cronTime: "0 7,12,17 * * *",
      onTick: async () => {
        try {
          await runCurrencyRatesRefresh("tick")
		} catch (err) {
			console.error("[CurrencyRates] onTick failed:", getErrorMessage(err))
		}
      },
      runOnInit: async () => {
		const rates = await currencyRatesModule.getCachedCurrencyRates()
        if (!rates) {
          try {
            await runCurrencyRatesRefresh("init")
			} catch (err) {
				console.error("[CurrencyRates] runOnInit failed:", getErrorMessage(err))
			}
        }
      },
      timeZone: "Europe/Moscow",
    },
  ],
}
