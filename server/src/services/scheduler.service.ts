import Cron from "moleculer-cron"
import Cache from "file-system-cache"
import { buildBondsData } from "../common/buildBondsData"

const cache = Cache({ ttl: 60 * 60 * 4 })
let isDataGrabberRunning = false

async function runDataGrabber(reason: "tick" | "init") {
  if (isDataGrabberRunning) {
    console.warn(`[DataGrabber] skip ${reason}; previous job is still running`)
    return
  }

  isDataGrabberRunning = true
  try {
    const data = await buildBondsData()
    await cache.set("bonds", data)
  } finally {
    isDataGrabberRunning = false
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
          console.error("[DataGrabber] onTick failed:", err?.message ?? err)
        }
      },
      runOnInit: async () => {
        const data = await cache.get("bonds")
        if (!data) {
          try {
            await runDataGrabber("init")
          } catch (err) {
            console.error("[DataGrabber] runOnInit failed:", err?.message ?? err)
          }
        }
      },
      timeZone: "GMT",
    },
  ],
}
