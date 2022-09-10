import {SwaggerWriter} from './swaggerWriter'
import * as crypto from 'node:crypto'
import {URL} from 'node:url'
import {validateURL} from "./utils/helpers";

export class SwaggerPropertyError extends Error {
	constructor({propertyName, propertyValue, extraDescription}) {
		super(
			`The specified property ${propertyName} received and incorrect value ${propertyValue}
			Additional description: ${extraDescription}`
		);
	}
}

export type SwagpressConfig = {
	outFile?: string,				// Default to `openapi.json`
	openApiVersion?: string,		// Default to 3.0.0
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
	m_swaggerWriter: SwaggerWriter
	m_swaggerConfig: SwagpressConfig
	m_routerShards: {
		[shardHash: string]: object
	} = {}

	openAPISchema: object

	/**
	 * @param {SwagpressConfig} swagpressConfig The configuration object for Swagpress
	 * @description Initializes a Swagpress Object
	 * @return {Swagpress} The configured Swagpress object
	 */
	constructor(swagpressConfig: SwagpressConfig) {
		this.m_swaggerConfig = {...swagpressConfig}
		this.m_swaggerConfig.outFile = this.m_swaggerConfig.outFile || "openapi.json"
		let outFile: string = this.m_swaggerConfig.outFile
		this.m_swaggerWriter = new SwaggerWriter(
			outFile
		)

		let openAPIVersion: string = this.m_swaggerConfig.openApiVersion || "3.0.0"

		/* Validate servers */
		const apiServers = this.m_swaggerConfig.apiServers
		apiServers.forEach((apiServer, serverIndex) => {
			const {url, variables} = apiServer

			validateURL(url, `servers[${serverIndex}].url`)

			const variableKeys = Object.keys(variables)
			variableKeys.forEach((variableKey) => {
				const variableData = variables[variableKey]
				if (variableData.enum){
					if (variableData.enum.indexOf(variableData.default) == -1){
						throw new SwaggerPropertyError(
						{
								propertyName: `servers[${serverIndex}].variables.${variableKey}`,
								propertyValue: variableData.default,
								extraDescription: 'Default value was not found within enum!'
							}
						)
					}
				}
			})
		})

		this.openAPISchema = {
			openapi: openAPIVersion,
			info: this.m_swaggerConfig.info,
			servers: apiServers
		}
	}
}