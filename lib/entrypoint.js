import { spawn, execSync } from "child_process";
import NodeClient from "./nodeClient.js";
import { CYCLONE_DISABLE_ENV_VAR } from "./constants.js";
export function spawnProcessAndCaptureOutput(argv, client) {
    const childProcess = spawn(argv[0], argv.slice(1));
    // pipe stdin to child process
    process.stdin.pipe(childProcess.stdin);
    childProcess.stdout.setEncoding('utf8');
    childProcess.stdout.on('data', function (data) {
        data = data.toString();
        process.stdout.write(data);
        client.captureStdout(data);
    });
    childProcess.stderr.setEncoding('utf8');
    childProcess.stderr.on('data', function (data) {
        data = data.toString();
        process.stderr.write(data);
        client.captureStderr(data);
    });
    childProcess.on('exit', (code, signal) => {
        client.captureExit(signal || "unknown", code || -1);
    });
    var onExitSigInt = function () {
        childProcess.kill('SIGINT');
        process.exit(0);
    };
    var onExitSigTerm = function () {
        childProcess.kill('SIGTERM');
        process.exit(0);
    };
    process.on('SIGINT', onExitSigInt);
    process.on('SIGTERM', onExitSigTerm);
}
/**
 * Helper to use in the cli entrypoint
 */
export default function runCli(projectId, apiKey, argv) {
    if (process.env[CYCLONE_DISABLE_ENV_VAR]) {
        try {
            execSync(argv.join(" "), { stdio: 'inherit' });
        }
        catch (e) {
            // ignore the error
        }
        return;
    }
    const client = new NodeClient(projectId, apiKey);
    spawnProcessAndCaptureOutput(argv, client);
}
;
