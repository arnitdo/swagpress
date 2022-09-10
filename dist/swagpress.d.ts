import { SwaggerWriter } from './swaggerWriter';
export declare class SwaggerPropertyError extends Error {
    constructor({ propertyName, propertyValue, extraDescription }: {
        propertyName: any;
        propertyValue: any;
        extraDescription: any;
    });
}
export declare type SwagpressConfig = {
    outFile?: string;
    apiName: string;
    apiDescription: string;
    apiVersion: string;
    openApiVersion?: string;
    apiServers: {
        url: string;
        description?: string;
        variables?: {
            [varName: string]: {
                default: string;
                enum?: string[];
                description?: string;
            };
        };
    }[];
};
export default class Swagpress {
    m_swaggerWriter: SwaggerWriter;
    m_swaggerConfig: SwagpressConfig;
    m_routerShards: {
        [shardHash: string]: object;
    };
    openAPISchema: object;
    /**
     * @param {SwagpressConfig} swagpressConfig The configuration object for Swagpress
     * @description Initializes a Swagpress Object
     * @return {Swagpress} The configured Swagpress object
     */
    constructor(swagpressConfig: SwagpressConfig);
}
