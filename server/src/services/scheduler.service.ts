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
        await cache.set("bonds", await buildBondsData())
      },
      runOnInit: async ()=> {
        const data =  await cache.get("bonds")
        if(!data) {
          await cache.set("bonds", await buildBondsData())
        }
      },
      timeZone: "GMT",
    },
  ],
}
