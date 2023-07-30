"use strict"
import { BrokerOptions, Errors, MetricRegistry } from "moleculer"

process.env.TZ = "UTC"
require("dotenv").config();

const brokerConfig: BrokerOptions = {
	namespace: "stopphish",
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
	logLevel: "debug",
	transporter: null,
	// transporter: "NATS",
	// cacher: { type: "Redis", options: { tl: 30, prefix: "SP" } },
	serializer: "CBOR",
	requestTimeout: 120 * 1000,
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
		check: (err: Errors.MoleculerError) => err && err.code >= 500,
	},
	bulkhead: {
		enabled: false,
		concurrency: 10,
		maxQueueSize: 100,
	},
	validator: true,
	errorHandler: null,
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

export = brokerConfig
