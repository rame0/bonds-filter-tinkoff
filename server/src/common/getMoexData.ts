import * as fs from "fs"
import path from "path"
import axios from "axios"
import moment from "moment"
import { sleep } from "./utils/sleep"
import { LiquidityType, MoexCoupon, MoexResults, MoexTrade } from "./innterfaces/Moex"


export function getMoexData(isins: string[]): Promise<MoexResults> {
	return new Promise((resolve, reject) => {
		const bondRequestColumns = "SECID,SECNAME,PREVLEGALCLOSEPRICE,BOARDID,COUPONPERIOD,FACEVALUE,FACEUNIT,SECTYPE"
		const url1 = `https://iss.moex.com/iss/engines/stock/markets/bonds/boardgroups/7/securities.json?iss.dp=comma&iss.meta=off&iss.only=securities,marketdata&securities.columns=${bondRequestColumns}&marketdata.columns=SECID,YIELD,DURATION`
		const url2 = `https://iss.moex.com/iss/engines/stock/markets/bonds/boardgroups/58/securities.json?iss.dp=comma&iss.meta=off&iss.only=securities,marketdata&securities.columns=${bondRequestColumns}&marketdata.columns=SECID,YIELD,DURATION`
		const url3 = `https://iss.moex.com/iss/engines/stock/markets/bonds/boardgroups/193/securities.json?iss.dp=comma&iss.meta=off&iss.only=securities,marketdata&securities.columns=${bondRequestColumns}&marketdata.columns=SECID,YIELD,DURATION`

		let marketData: MoexResults = {}

		axios.all([
			axios.get(url1),
			axios.get(url2),
			axios.get(url3),
		])
			.then(axios.spread(async (firstResponse, secondResponse, thirdResponse) => {
				// console.log(firstResponse.data)
				// throw new Error()
				const md1 = await buildDataFromMoex(firstResponse.data, isins)
				const md2 = await buildDataFromMoex(secondResponse.data, isins)
				const md3 = await buildDataFromMoex(thirdResponse.data, isins)
				marketData = { ...md1, ...md2, ...md3 }
				resolve(marketData)
			}))
			.catch(error => console.log(error))
	})
}


export async function buildDataFromMoex(marketData, isins: string[]) {
	const DateRequestPrevious = moment().subtract(15, "days").format("YYYY-MM-DD")
	const nowTime = new Date().getTime()

	const cachePath = path.join(__dirname, "../caches/moex")
	if (!fs.existsSync(cachePath)) {
		fs.mkdirSync(cachePath, { recursive: true })
	}

	const result: MoexResults = {}
	// let skipped = 0

	for (const i in marketData?.securities?.data) {
		const marketRow = marketData.securities.data[i]
		const rowData = marketData.marketdata.data[i]

		const secId: string = marketRow[0]
		if (!isins.includes(secId)) {
			// console.log("skipped", ++skipped)
			continue
		}

		result[secId] = {
			SECID: secId,
			BOARDID: marketRow[3],
			TYPE: +marketRow[7],
			FaceValue: marketRow[5],
			FaceUnit: marketRow[6],
			BondPrice: marketRow[2],
			CouponPeriod: marketRow[4],
			BondVolume: -1,
			BondYield: rowData[1],
			BondDuration: Math.floor((rowData[2] / 30) * 100) / 100,
			MonthsOfPaymentsDates: null,
			liquidity: LiquidityType.high,
		}

		await sleep(10)
		const couponsCacheFile = `${cachePath}/${secId}-coupons.json`
		result[secId].coupons = []

		if (fs.existsSync(couponsCacheFile)) {
			const { mtime } = fs.statSync(couponsCacheFile)
			if (mtime.getTime() > nowTime - 1000 * 60 * 60 * 4) {
				result[secId].coupons = JSON.parse(fs.readFileSync(couponsCacheFile, "utf8"))
				result[secId].coupons.forEach(coupon => {
					coupon.date = moment(coupon.date)
				})
			}
		}
		if (result[secId].coupons.length < 1) {
			console.log("loading coupons: ", secId)
			const response = await axios.get(`https://iss.moex.com/iss/statistics/engines/stock/markets/bonds/bondization/${secId}.json?iss.meta=off&iss.only=coupons&coupons.columns=coupondate,faceunit,value,valueprc,value_rub`)
			response.data?.coupons?.data.forEach(resp => {
				const coupon: MoexCoupon = {} as MoexCoupon
				coupon.date = moment(resp[0])
				coupon.faceUnit = resp[1]
				coupon.value = +resp[2]
				coupon.valuePrc = +resp[3]
				coupon.valueRub = +resp[4]
				result[secId].coupons.push(coupon)
			})

			fs.writeFileSync(couponsCacheFile, JSON.stringify(result[secId].coupons))
		}

		const nowDate = moment()
		result[secId].couponsYield = result[secId].coupons.reduce<number>((acc, coupon) =>
			coupon.date.isAfter(nowDate) ? acc + coupon.value : acc, 0)

		if (result[secId].BondVolume < 0) {
			const tradesCacheFile = `${cachePath}/${secId}-trades.json`
			result[secId].trades = []
			if (fs.existsSync(tradesCacheFile)) {
				const { mtime } = fs.statSync(tradesCacheFile)
				if (mtime.getTime() > nowTime - 1000 * 60 * 60) {
					result[secId].trades = JSON.parse(fs.readFileSync(tradesCacheFile, "utf8"))
					result[secId].trades.forEach(trade => {
						trade.date = moment(trade.date)
					})
				}
			}

			if (result[secId].trades.length < 1) {
				console.log("loading trades: ", secId)
				const response = await axios.get(`https://iss.moex.com/iss/history/engines/stock/markets/bonds/boards/${result[secId].BOARDID}/securities/${secId}.json?iss.meta=off&iss.only=history&history.columns=TRADEDATE,VOLUME,NUMTRADES&limit=20&from=${DateRequestPrevious}`)

				if (!response.data?.history) {
					result[secId].BondVolume = 0
					result[secId].liquidity = LiquidityType.low
					result[secId].tradeDays = 0
				} else {
					response.data?.history?.data.forEach(resp => {
						const trade: MoexTrade = {} as MoexTrade
						trade.date = moment(resp[0])
						trade.volume = +resp[1]
						trade.numTrades = +resp[2]
						result[secId].trades.push(trade)
					})
				}

				fs.writeFileSync(tradesCacheFile, JSON.stringify(result[secId].trades))
			}

			if (result[secId].trades.length < 1) {
				continue
			}

			let volumeSum = 0
			let lowLiquidity = false

			for (const histItem of result[secId].trades) {
				const volume = histItem.volume
				volumeSum += volume
				if (1 > volume) { // если оборот в конкретный день меньше
					lowLiquidity = true
				}
			}
			result[secId].tradeDays = result[secId].trades.length
			if (result[secId].tradeDays < 6) { // если всего дней в апи на этом периоде очень мало
				lowLiquidity = true
			}

			result[secId].liquidity = lowLiquidity ? LiquidityType.low : LiquidityType.high
			result[secId].BondVolume = volumeSum

		}
	}

	return result
}
