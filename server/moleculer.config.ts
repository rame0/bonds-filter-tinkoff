"use strict"
import { BrokerOptions, Errors, LogLevels, MetricRegistry } from "moleculer"
import { config } from "dotenv"

process.env.TZ = "UTC"
config()

const brokerConfig: BrokerOptions = {
	namespace: "bonds-filter-tinkoff",
	nodeID: null,
	metadata: {},
	logger: {
		type: "Console",
		options: {
			colors: true,
			moduleColors: false,
			formatter: "full",
			objectPrinter: null,
			autoPadding: false,
		},
	},
	logLevel: (process.env.LOGLEVEL ?? "info") as LogLevels,
	transporter: null,
	// transporter: "NATS",
	// cacher: { type: "Memory", options: { tl: 1500, prefix: "BF" } },
	serializer: "CBOR",
	requestTimeout: 1200 * 1000,
	retryPolicy: { enabled: false },
	maxCallLevel: 100,
	heartbeatInterval: 10,
	heartbeatTimeout: 30,
	contextParamsCloning: false,
	tracking: { enabled: false, shutdownTimeout: 5000 },
	disableBalancer: false,
	registry: { strategy: "RoundRobin", preferLocal: true },

	circuitBreaker: {
		enabled: false,
		threshold: 0.5,
		minRequestCount: 20,
		windowTime: 60,
		halfOpenTime: 10 * 1000,
		check: (err: Errors.MoleculerError | Error) => err instanceof Errors.MoleculerError && err.code >= 500,
	},
	bulkhead: {
		enabled: false,
		concurrency: 10,
		maxQueueSize: 100,
	},
	validator: true,
	errorHandler: undefined,
	metrics: {
		enabled: false,
		reporter: {
			type: "Prometheus",
			options: {
				port: 3030,
				path: "/metrics",
				defaultLabels: (registry: MetricRegistry) => ({
					namespace: registry.broker.namespace,
					nodeID: registry.broker.nodeID,
				}),
			},
		},
	},

	tracing: {
		enabled: false,
		events: true,
		exporter: [{ type: "Console", options: { logger: null, colors: true, width: 100, gaugeWidth: 40 } }],
	},

	middlewares: [],
}

export default brokerConfig
