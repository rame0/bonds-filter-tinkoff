import ApiGateway from "moleculer-web"


export default {
	name: "api",
	mixins: [ApiGateway],
	settings: {
		port: process.env.PORT || 3000,
			routes: [
				{
					path: "/api",
					whitelist: ["bonds.*"],
				},
			],
		assets: {
			folder: "public",
		},
	},
}
