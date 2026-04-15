import { beforeEach, describe, expect, mock, test } from "bun:test"

const getBondCouponsMock = mock(async () => ({ events: [] as any[] }))

mock.module("../common/api", () => ({
	api: {
		instruments: {
			getBondCoupons: getBondCouponsMock,
		},
	},
}))

mock.module("../common/getOrBuildBondsData", () => ({
	getOrBuildBondsData: mock(async () => []),
}))

const { default: bondsService } = await import("./bonds.service")

describe("bonds.service coupons action", () => {
	beforeEach(() => {
		getBondCouponsMock.mockReset()
	})

	test("sorts future coupons and maps payout from payOneBond", async () => {
		getBondCouponsMock.mockResolvedValue({
			events: [
				{
					couponNumber: 3,
					couponDate: futureDate(30),
					payOneBond: { units: 7, nano: 250000000 },
				},
				{
					couponNumber: 1,
					couponDate: futureDate(-30),
					payOneBond: { units: 99, nano: 0 },
				},
				{
					couponNumber: 2,
					couponDate: futureDate(10),
					payOneBond: { units: 5, nano: 500000000 },
				},
			],
		})

		const result = await bondsService.actions.coupons.handler({
			params: { id: "figi-1" },
			meta: {},
		})

		expect(getBondCouponsMock).toHaveBeenCalledWith({ figi: "figi-1" })
		expect(result).toHaveLength(2)
		expect(result.map((coupon: any) => coupon.couponNumber)).toEqual([2, 3])
		expect(result.map((coupon: any) => coupon.payout)).toEqual([5.5, 7.25])
	})

	test("respects explicit coupon limit", async () => {
		getBondCouponsMock.mockResolvedValue({
			events: [
				{ couponNumber: 1, couponDate: futureDate(1), payOneBond: { units: 1, nano: 0 } },
				{ couponNumber: 2, couponDate: futureDate(2), payOneBond: { units: 2, nano: 0 } },
				{ couponNumber: 3, couponDate: futureDate(3), payOneBond: { units: 3, nano: 0 } },
			],
		})

		const result = await bondsService.actions.coupons.handler({
			params: { id: "figi-2", limit: 2 },
			meta: {},
		})

		expect(result).toHaveLength(2)
		expect(result.map((coupon: any) => coupon.couponNumber)).toEqual([1, 2])
	})
})

function futureDate(offsetDays: number) {
	return new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000).toISOString()
}
