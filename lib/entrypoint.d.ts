import NodeClient from "./nodeClient.js";
export declare function spawnProcessAndCaptureOutput(argv: string[], client: NodeClient): void;
/**
 * Helper to use in the cli entrypoint
 */
export default function runCli(projectId: string, apiKey: string, argv: string[]): void;
