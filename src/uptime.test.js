import { checkUptimeAll, checkUptimeEntry, normalize, propagateDefault } from "./uptime";
import jest from 'jest';

const minimalGithub = {
    url: 'https://github.com',
};

describe('successful requests', () => {
    test('minimal', async () => {
        await expect(checkUptimeEntry(minimalGithub)).resolves.toMatchObject({success: true});
    });

    test('minimal list', async () => {
        await expect(Promise.all(checkUptimeAll([minimalGithub, minimalGithub]))).resolves.toMatchObject([{success: true}, {success: true}]);
    });
});

describe('malformed single', () => {
    test('undefined', () => {
        expect(checkUptimeEntry()).toBeDefined();
        expect(checkUptimeEntry()).rejects;
    });
    test('null', () => {
        expect(checkUptimeEntry(null)).toBeDefined();
        expect(checkUptimeEntry(null)).rejects;
    });
})

describe('malformed list', () => {
    test('undefined', () => {
        expect(Promise.all(checkUptimeAll())).resolves.toBeDefined();
        expect(checkUptimeAll()).toMatchObject([]);
    });
    test('null', () => {
        expect(Promise.all(checkUptimeAll(null))).resolves.toBeDefined();
        expect(checkUptimeAll(null)).toMatchObject([]);
    });
})

describe('normalize', () => {
    test('minimal', () => {
        expect(normalize(minimalGithub)).toMatchSnapshot();
    });
    test('undefined', () => {
        expect(normalize()).toBeDefined();
    });
    test('null', () => {
        expect(normalize(null)).toBeDefined();
    });
})

describe('propagateDefaults', () => {
    test('propagateBeginning', () => {
        const servers = [
            {
                url: 'A',
                _default: {
                    timeout: 1000,
                },
            },
            {
                url: 'B',
            },
            {
                url: 'C',
            },
        ]
        const expectedTimeouts = [1000, 1000, 1000];
        expectedTimeouts.forEach((v, i) => {
            expect(propagateDefault(servers)?.[i]?.timeout).toBe(v);
        });
    })
    test('propagateMiddle', () => {
        const servers = [
            {
                url: 'A',
            },
            {
                url: 'B',
                _default: {
                    timeout: 1000,
                },
            },
            {
                url: 'C',
            },
        ]
        const expectedTimeouts = [0, 1000, 1000];
        expectedTimeouts.forEach((v, i) => {
            expect(propagateDefault(servers)?.[i]?.timeout).toBe(v);
        });
    })
    test('propagateTwice', () => {
        const servers = [
            {
                url: 'A',
                _default: {
                    timeout: 1000,
                },
            },
            {
                url: 'B',
            },
            {
                url: 'C',
                _default: {
                    timeout: 3000,
                },
            },
        ]
        const expectedTimeouts = [1000, 1000, 3000];
        expectedTimeouts.forEach((v, i) => {
            expect(propagateDefault(servers)?.[i]?.timeout).toBe(v);
        });
    })
})