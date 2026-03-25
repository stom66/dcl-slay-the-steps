import { initClient } from "./client/index";
import { initServer } from "./server/index";

import { isServer } from "@dcl/sdk/network";

export function main(): void {
	if (isServer()) {
		console.log("Initializing server")
		initServer()
	} else {
		console.log("Initializing client")
		initClient()
	}
}