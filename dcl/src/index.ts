import { mainClient } from "./client";
import { mainServer } from "./server";

import { isServer } from "@dcl/sdk/network";

export function main(): void {
	if (isServer()) {
		mainServer()
	} else {
		mainClient()
	}
}