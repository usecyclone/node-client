import { execSync } from "child_process";
import pty from 'node-pty';
import NodeClient from "./nodeClient.js";
import { CYCLONE_DISABLE_ENV_VAR } from "./constants.js";
export function spawnProcessAndCaptureOutput(argv, client) {
    const SIGNALS = [
        "",
        "SIGHUP",
        "SIGINT",
        "SIGQUIT",
        "SIGILL",
        "SIGTRAP",
        "SIGABRT",
        "SIGEMT",
        "SIGFPE",
        "SIGKILL",
        "SIGBUS",
        "SIGSEGV",
        "SIGSYS",
        "SIGPIPE",
        "SIGALRM",
        "SIGTERM",
        "SIGURG",
        "SIGSTOP",
        "SIGTSTP",
        "SIGCONT",
        "SIGCHLD",
        "SIGTTIN",
        "SIGTTOU",
        "SIGIO",
        "SIGXCPU",
        "SIGXFSZ",
        "SIGVTALRM",
        "SIGPROF",
        "SIGWINCH",
        "SIGINFO",
        "SIGUSR1",
        "SIGUSR2"
    ];
    const childProcess = pty.spawn(argv[0], argv.slice(1), {
        name: 'xterm-256color',
        cwd: process.cwd(),
        encoding: "utf8",
        ...process.env
    });
    childProcess.onData(function (data) {
        process.stdout.write(data);
        client.captureStdout(data);
    });
    childProcess.on("exit", (exitCode, signal) => {
        let signalString = "unknown";
        if (signal && signal >= 1 && signal < SIGNALS.length) {
            signalString = SIGNALS[signal];
        }
        client.captureExit(signalString, exitCode);
        process.exit(exitCode);
    });
    var onExitSigInt = function () {
        childProcess.write("\x03");
        childProcess.kill('SIGINT');
    };
    var onExitSigTerm = function () {
        childProcess.kill('SIGTERM');
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
