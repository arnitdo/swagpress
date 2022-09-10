import {URL} from "node:url";
import {SwaggerPropertyError} from "../swagpress";

/**
 * @param {URL} url The url to validate
 * @param {string} propertyName The Swagger property name to display in errors
 * @exception {SwaggerPropertyError} Throws SwaggerPropertyError if URL is invalid
 * @exception {Error} Throws any other generic error that occurred during execution
 */
export function validateURL(url: string, propertyName: string){
	try {
		let urlValue = new URL(url)
	} catch (err: unknown){
		if (err.code == 'ERR_INVALID_URL'){
			throw new SwaggerPropertyError({
				propertyName: propertyName,
				propertyValue: url,
				extraDescription: 'Invalid URL Provided!'
			})
		} else {
			throw err
		}
	}
}