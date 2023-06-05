import { PostHog } from 'posthog-node';
export default class NodeClient {
    projectId: string;
    posthogClient: PostHog;
    machineId: string;
    constructor(projectId: string, apiKey: string);
    _setup(): void;
    _reportArgvEvent(): void;
    _getShutdownSignalHandler(signal: String): () => void;
    _getMetadata(): {
        projectId: string;
        machineId: string;
    };
    captureExit(signal: String, code: number): void;
    captureStdout(data: string): void;
    captureStderr(data: string): void;
    shutdownAsync(): Promise<void>;
    shutdown(): void;
}
