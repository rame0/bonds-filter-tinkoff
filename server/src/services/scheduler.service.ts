import Cron from "moleculer-cron"
import { getCachedBondsData, getOrBuildBondsData } from "../common/getOrBuildBondsData"
let isDataGrabberRunning = false

async function runDataGrabber(reason: "tick" | "init") {
  if (isDataGrabberRunning) {
    console.warn(`[DataGrabber] skip ${reason}; previous job is still running`)
    return
  }

  isDataGrabberRunning = true
  try {
    await getOrBuildBondsData(true)
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
        const data = await getCachedBondsData()
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
