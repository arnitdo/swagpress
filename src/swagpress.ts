import * as crypto from 'node:crypto'
import {URL} from 'node:url'
import {validateURL} from "./utils/helpers";

export class SwaggerPropertyError extends Error {
	constructor(propertyName: string, propertyValue: string, extraDescription?: string) {
		super(
			`The specified property ${propertyName} received and incorrect value ${propertyValue}
			Additional description: ${extraDescription || 'None'}`
		);
	}
}

export class SwaggerRouteError extends Error {
	constructor(shard: string){
		super(
			`Failed to resolve route shard ${shard}`
		);
	}
}

export type SwagpressConfig = {
	outFile?: string,				// Default to `openapi.json`
	info: {
		apiName: string
		apiDescription: string,
		apiVersion: string,
		contact?: {
			name?: string
			email?: string,
			url?: string
		}
		termsOfService?: string
	}
	apiServers: {
		url: string,
		description?: string		// Optional description
		variables?: {
			[varName: string]: {
				default: string,	// Note that default value must be within enum if provided
				enum?: string[],
				description?: string
			}
		}			// Default to {}
	}[]
}

export default class Swagpress {
	m_swaggerConfig: SwagpressConfig
	m_routerShards: {
		[shardHash: string]: string
	} = {}

	private openAPISchema: object

	/**
	 * @param {SwagpressConfig} swagpressConfig The configuration object for Swagpress
	 * @description Initializes a Swagpress Object
	 * @return {Swagpress} The configured Swagpress object
	 */
	constructor(swagpressConfig: SwagpressConfig) {
		this.m_swaggerConfig = {...swagpressConfig}
		this.m_swaggerConfig.outFile = this.m_swaggerConfig.outFile || "openapi.json"

		/* Validate servers */
		const apiServers = this.m_swaggerConfig.apiServers
		apiServers.forEach((apiServer, serverIndex) => {
			const url = apiServer.url
			const variables = apiServer.variables || {}

			validateURL(url, `servers[${serverIndex}].url`)

			const variableKeys = Object.keys(variables)
			variableKeys.forEach((variableKey) => {
				const variableData = variables[variableKey]
				if (variableData.enum){
					if (variableData.enum.indexOf(variableData.default) == -1){
						throw new SwaggerPropertyError(
				`servers[${serverIndex}].variables.${variableKey}`,
							variableData.default,
							'Default value was not found within enum!'
						)
					}
				}
			})
		})

		this.openAPISchema = {
			openapi: "3.0.0",
			info: this.m_swaggerConfig.info,
			servers: apiServers
		}
	}

	/**
	 * @description Use this function to create top-level routes.
	 * For nested / deeper routes, use {@link routeWithShard} and {@link combineShards}
	 * @param {string} route The route to create a shard of
	 * @return {[string, string]} [route, routeShard] Returns (1) The route as is
	 * (2) The shard of the route to use
	*/
	createShard(route: string): [string, string] {
		if (!route.startsWith("/")){
			route = "/" + route
		}
		if (route.endsWith("/")){
			route = route.slice(0, -1)
		}
		if (route in this.m_routerShards){
			return [route, this.m_routerShards[route]]
		} else {
			const routeShard = crypto
				.createHash('sha256')
				.update(route)
				.digest('hex')
			this.m_routerShards[routeShard] = route
			return [route, routeShard]
		}
	}

	/**
	 *
	 */
	combineShards(...shards: string[]): string {
		let resolvedPath = ""
		shards.forEach((shard) => {
			if (shard in this.m_routerShards){
				resolvedPath.concat(
					this.m_routerShards[shard]
				)
			} else {
				throw new SwaggerRouteError(shard)
			}
		})
		const routeShard = crypto
			.createHash("sha256")
			.update(resolvedPath)
			.digest("hex")

		return routeShard
	}


	/**
	 * @description
	 * @param {string} shard The route shard to use
	 * @param {string} route The route path to use
	 * @returns {string} The route path, as-is
	 */
	routeWithShard(shard: string, route: string): string {
		if (shard in this.m_routerShards){
			// TODO: Set internal context here

			if (!route.startsWith("/")){
				route = "/" + route
			}
			if (route.endsWith("/")){
				route = route.slice(0, -1)
			}

			const basePath = this.m_routerShards[shard]

			return basePath + route
		} else {
			throw new SwaggerRouteError(shard)
		}
	}

	deleteShard(shard: string): boolean {
		const allShards = Object.keys(this.m_routerShards)
		if (allShards.indexOf(shard) == -1){
			return false
		}
		delete this.m_routerShards[shard]
		return true
	}
}