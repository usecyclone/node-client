#!/usr/bin/env node

import spawnProcessAndCaptureOutput from './entrypoint.js';
import NodeClient from './nodeClient.js';

/** 
 * prepend the CLI before the actual command
 * 
 * if the desired command is: node index.js
 * then replace it with: [cli_executable_name] node index.js
 */
export const cli = () => {
    const argv = process.argv.slice(2)

    const projectId = process.env.npm_package_config_cyclone_project || "default"
    const apiKey = process.env.npm_package_config_cyclone_apikey

    if (!apiKey) {
        throw new Error("Fatal: No API key found in $npm_package_config_cyclone_apikey")
    }

    if (!projectId) {
        console.error("No project ID found in $npm_package_config_cyclone_project, using default")
    }

    const client = new NodeClient(projectId, apiKey)

    spawnProcessAndCaptureOutput(argv, client)
}

cli();