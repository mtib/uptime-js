import { readFileSync } from 'fs';
import { checkUptimeEntry } from './uptime';
import colors from 'colors/safe';

const serverDefinitions = process.argv.slice(2);
const data = serverDefinitions.map(definitonFile => JSON.parse(readFileSync(definitonFile, 'utf-8'))).flat();

const pad = {
    method: data.map(entry => entry?.method?.length).reduce((acc, curr) => curr > acc ? curr : acc),
    name: data.map(entry => entry?.name?.length || entry?.url?.length).reduce((acc, curr) => curr > acc ? curr : acc),
}

const promises = data.map((server) => {
    const start = Date.now();
    checkUptimeEntry(server).then(({success, status}) => {
        console.log((success ? colors.green : colors.red)(`${colors.bold(server?.method?.toUpperCase() || "GET").padStart(pad.method)} ${status} ${(server?.name || server?.url).padStart(pad.name)} ${String(Date.now() - start).padStart(4)}ms ${success ? '✔' : '❌'}`));
    });
})

Promise.all(promises);