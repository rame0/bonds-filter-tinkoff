import Cron from "moleculer-cron"
import Cache from "file-system-cache"
import { buildBondsData } from "../common/buildBondsData"

const cache = Cache({ ttl: 60 * 60 * 4 })

module.exports = {
  name: "cron-job",

  mixins: [Cron],

  crons: [
    {
      name: "DataGrabber",
      cronTime: "* */4 * * *",
      onTick: async () => {
        try {
          const data = await buildBondsData()
          await cache.set("bonds", data)
        } catch (err) {
          console.error("[DataGrabber] onTick failed:", err?.message ?? err)
        }
      },
      runOnInit: async () => {
        const data = await cache.get("bonds")
        if (!data) {
          try {
            const built = await buildBondsData()
            await cache.set("bonds", built)
          } catch (err) {
            console.error("[DataGrabber] runOnInit failed:", err?.message ?? err)
          }
        }
      },
      timeZone: "GMT",
    },
  ],
}
