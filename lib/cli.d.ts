#!/usr/bin/env node
/**
 * prepend the CLI before the actual command
 *
 * if the desired command is: node index.js
 * then replace it with: [cli_executable_name] node index.js
 */
export declare const cli: () => void;
