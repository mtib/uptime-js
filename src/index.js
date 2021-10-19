import { readFileSync } from 'fs';
import { checkUptimeEntry, propagateDefault } from './uptime';
import colors from 'colors/safe';

const serverDefinitions = process.argv.slice(2);
const data = serverDefinitions.map(definitonFile => propagateDefault(JSON.parse(readFileSync(definitonFile, 'utf-8')))).flat();

const name = entry => entry?.name || entry?.url;

const pad = {
    method: data.map(entry => entry?.method?.length).reduce((acc, curr) => curr > acc ? curr : acc),
    name: data.map(entry => name(entry)?.length).reduce((acc, curr) => curr > acc ? curr : acc),
}

const promises = data.map((server) => {
    checkUptimeEntry(server).then(({success, status, durationMs, size}) => {
        if (success) {
            console.log((success ? colors.green : colors.red)(`${colors.bold((server?.method?.toUpperCase() || "GET").padStart(pad.method))} ${status} ${(name(server)).padStart(pad.name)} ${String(durationMs).padStart(4)}ms ${success ? '✔' : '❌'} [${Math.ceil(size/1024)}kB]`));
        } else {
            if (status.toJSON) {
                console.log((success ? colors.green : colors.red)(`${colors.bold((server?.method?.toUpperCase() || "GET").padStart(pad.method))} ${(name(server)).padStart(pad.name+4)}        ${success ? '✔' : 'x'} ${status.message}`))
            } else {
                console.log((success ? colors.green : colors.red)(`${colors.bold((server?.method?.toUpperCase() || "GET").padStart(pad.method))} ${status} ${(name(server)).padStart(pad.name)} ${String(durationMs).padStart(4)}ms ${success ? '✔' : 'x'} [${Math.ceil(size/1024)}kB]`))
            }
        }
    });
})

Promise.all(promises);