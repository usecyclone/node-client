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
    shutdownAsync(): Promise<void>;
    shutdown(): void;
}
