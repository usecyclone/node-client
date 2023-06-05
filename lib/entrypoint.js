import { spawn } from "child_process";
export default function spawnProcessAndCaptureOutput(argv, client) {
    const childProcess = spawn(argv[0], argv.slice(1));
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
}
