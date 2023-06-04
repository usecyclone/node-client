import { PostHog } from 'posthog-node';
export default class NodeClient {
    projectId: string;
    posthogClient: PostHog;
    machineId: string;
    constructor(projectId: string, apiKey: string);
    getSignalHandler(signal: String): () => void;
    shutdownAsync(): Promise<void>;
    shutdown(): void;
}
