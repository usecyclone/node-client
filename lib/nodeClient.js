import { PostHog } from 'posthog-node';
import { CYCLONE_POSTHOG_ADDRESS } from './constants';
import machineId from 'node-machine-id';
export default class NodeClient {
    projectId;
    posthogClient;
    machineId;
    constructor(projectId, apiKey) {
        this.projectId = projectId;
        this.posthogClient = new PostHog(apiKey, {
            host: CYCLONE_POSTHOG_ADDRESS
        });
        this.machineId = machineId.machineIdSync(true);
        // Use prepend listener because we want to run Cyclone signal handler before
        // another signal handler that explicitly calls process.exit()
        process.prependListener('SIGINT', this.getSignalHandler('SIGINT'));
        process.prependListener('SIGTERM', this.getSignalHandler('SIGTERM'));
    }
    getSignalHandler(signal) {
        return () => {
            // this.posthogClient.capture()
            console.log("CYCLONE SIGNAL HANDLER:", signal);
            this.shutdown();
        };
    }
    async shutdownAsync() {
        await this.posthogClient.shutdownAsync();
    }
    shutdown() {
        this.posthogClient.shutdown();
    }
}
