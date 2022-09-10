import * as fs from "fs";

export class SwaggerWriter {
	outFile: string
	constructor(outFile: string){
		this.outFile = outFile
		console.log("SwaggerWriter initialized successfully")
	}
}