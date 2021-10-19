import { readFileSync } from 'fs';
import { checkUptimeEntry } from './uptime';
import colors from 'colors/safe';

const serverDefinitions = process.argv.slice(2);
const data = serverDefinitions.map(definitonFile => JSON.parse(readFileSync(definitonFile, 'utf-8'))).flat();

const promises = data.map((server) => {
    const start = Date.now();
    checkUptimeEntry(server).then(({success, status}) => {
        console.log((success ? colors.green : colors.red)(`${colors.bold(server?.method?.toUpperCase() || "GET")} ${server?.name || server?.url} ${success ? '✔' : '❌'} ${status} ${Date.now() - start}ms`));
    });
})

Promise.all(promises);