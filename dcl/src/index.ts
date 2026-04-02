import { initClient } from "./client/index";
import { initServer } from "./server/index";

import { isServer } from "@dcl/sdk/network";

export async function main(): Promise<void> {
	if (isServer()) {
		console.log("Initializing server")
		await initServer()
	} else {
		console.log("Initializing client")
		await initClient()
	}
}