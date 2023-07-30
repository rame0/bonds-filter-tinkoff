import ApiGateway from "moleculer-web"


module.exports = {
	name: "api",
	mixins: [ApiGateway],
	settings: {
		port: process.env.PORT || 3000,
		routes: [
			{
				path: "/api",
				whitelist: ["**"],
			},
		],
		assets: {
			folder: "public",
		},
	},
}
