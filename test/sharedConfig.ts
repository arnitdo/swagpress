import Swagpress from "../src";

const testSwagpress = new Swagpress({
	info: {
		apiName: "Swagpress Test API",
		apiVersion: "1.0.0",
		contact: {
			name: "Test User",
			email: "<test@example.org>",
			url: "https://example.org/"
		},
		apiDescription: "Swagpress Testing API"
	},
	apiServers: [
		{
			url: "http://localhost",
		}
	]
})

export default testSwagpress