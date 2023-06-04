import { PostHog } from 'posthog-node';
import { CYCLONE_POSTHOG_ADDRESS } from './constants.js';
import machineId from 'node-machine-id';
export default class NodeClient {
    projectId;
    posthogClient;
    machineId;
    constructor(projectId, apiKey) {
        this.projectId = projectId;
        this.posthogClient = new PostHog(apiKey, {
            host: CYCLONE_POSTHOG_ADDRESS,
            // use aggressive flush policy since CLI is used
            flushAt: 1,
            flushInterval: 0,
        });
        this.machineId = machineId.machineIdSync(true);
        this._setup();
    }
    _setup() {
        // Use prepend listener because we want to run Cyclone signal handler before
        // another signal handler that explicitly calls process.exit()
        process.prependListener('SIGINT', this._getShutdownSignalHandler('SIGINT'));
        process.prependListener('SIGTERM', this._getShutdownSignalHandler('SIGTERM'));
        this._reportArgvEvent();
    }
    _reportArgvEvent() {
        this.posthogClient.capture({
            distinctId: this.machineId,
            event: "argv",
            properties: {
                ...this._getMetadata(),
                argv: process.argv,
            }
        });
    }
    _getShutdownSignalHandler(signal) {
        return () => {
            this.posthogClient.capture({
                distinctId: this.machineId,
                event: "cli_os_signal",
                properties: {
                    ...this._getMetadata(),
                    signal: signal,
                }
            });
            // TODO: debug why the flush here is not working
            this.posthogClient.flush();
            this.shutdown();
        };
    }
    _getMetadata() {
        return {
            projectId: this.projectId,
            machineId: this.machineId
        };
    }
    async shutdownAsync() {
        await this.posthogClient.shutdownAsync();
    }
    shutdown() {
        this.posthogClient.shutdown();
    }
}