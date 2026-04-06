import { initClient } from "./client";
import { initServer } from "./server";

import { isServer } from "@dcl/sdk/network";

export function main(): void {
	if (isServer()) {
		initServer()
	} else {
		initClient()
	}
}