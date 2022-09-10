"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwaggerPropertyError = void 0;
var swaggerWriter_1 = require("./swaggerWriter");
var node_url_1 = require("node:url");
var SwaggerPropertyError = /** @class */ (function (_super) {
    __extends(SwaggerPropertyError, _super);
    function SwaggerPropertyError(_a) {
        var propertyName = _a.propertyName, propertyValue = _a.propertyValue, extraDescription = _a.extraDescription;
        return _super.call(this, "The specified property ".concat(propertyName, " received and incorrect value ").concat(propertyValue, "\n\t\t\tAdditional description: ").concat(extraDescription)) || this;
    }
    return SwaggerPropertyError;
}(Error));
exports.SwaggerPropertyError = SwaggerPropertyError;
var Swagpress = /** @class */ (function () {
    /**
     * @param {SwagpressConfig} swagpressConfig The configuration object for Swagpress
     * @description Initializes a Swagpress Object
     * @return {Swagpress} The configured Swagpress object
     */
    function Swagpress(swagpressConfig) {
        this.m_routerShards = {};
        this.m_swaggerConfig = __assign({}, swagpressConfig);
        this.m_swaggerConfig.outFile = this.m_swaggerConfig.outFile || "openapi.json";
        var outFile = this.m_swaggerConfig.outFile;
        this.m_swaggerWriter = new swaggerWriter_1.SwaggerWriter(outFile);
        var openAPIVersion = this.m_swaggerConfig.openApiVersion || "3.0.0";
        /* Validate servers */
        var apiServers = this.m_swaggerConfig.apiServers;
        apiServers.forEach(function (apiServer, serverIndex) {
            try {
                var url = apiServer.url, variables_1 = apiServer.variables;
                var apiServerURL = new node_url_1.URL(url);
                var variableKeys = Object.keys(variables_1);
                variableKeys.forEach(function (variableKey) {
                    var variableData = variables_1[variableKey];
                    if (variableData.enum) {
                        if (variableData.enum.indexOf(variableData.default) == -1) {
                            throw new SwaggerPropertyError({
                                propertyName: "servers[".concat(serverIndex, "].variables.").concat(variableKey),
                                propertyValue: variableData.default,
                                extraDescription: 'Default value was not found within enum!'
                            });
                        }
                    }
                });
            }
            catch (err) {
                if (err.code && err.code == 'ERR_INVALID_URL') {
                    throw new SwaggerPropertyError({
                        propertyName: "servers[".concat(serverIndex, "].url"),
                        propertyValue: apiServer.url,
                        extraDescription: 'Invalid URL Provided!'
                    });
                }
            }
        });
        this.openAPISchema = {
            openapi: openAPIVersion,
            info: {
                name: this.m_swaggerConfig.apiName,
                description: this.m_swaggerConfig.apiDescription
            },
            servers: apiServers
        };
    }
    return Swagpress;
}());
exports.default = Swagpress;
//# sourceMappingURL=swagpress.js.map