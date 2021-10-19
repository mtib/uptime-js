import axios from "axios";

export const checkUptimeAll = (servers) => {
    if (servers?.map) {
        return servers?.map?.(checkUptimeEntry);
    } else {
        return [];
    }
}

export const normalize = (server) => {
    return {
        url: server?.url,
        name: server?.name || server?.url,
        method: server?.method || 'GET',
        status: (() => {
            if (typeof server?.status === 'function') {
                return server.status;
            }
            if (typeof server?.status === 'object') {
                return (status) => server?.status.includes(status);
            }
            return (status) => status >= 200 && status < 300; 
        })(),
        payload: server?.payload,
        timeout: server?.timeout || 0,
    }
}

export const propagateDefault = (servers) => {
    const serverDefaults = {};
    return servers.map((server) => {
        if (server?._default) {
            Object.assign(serverDefaults, server._default);
        }
        Object.assign(server, serverDefaults);
        return normalize(server);
    });
}

export const checkUptimeEntry = (server) => {
    const start = Date.now();
    return axios({
        url: server?.url,
        method: server?.method,
        data: server?.payload,
        validateStatus: undefined,
        timeout: server?.timeout,
        responseType: 'arraybuffer',
    }).then((response) => {
        const end = Date.now();
        return { 
            success: (() => {
                if (typeof server?.status === 'function') {
                    return server.status;
                }
                if (typeof server?.status === 'object') {
                    return (status) => server?.status.includes(status);
                }
                return (status) => status >= 200 && status < 300; 
            })()(response.status), 
            status: response.status, 
            config: response.config,
            server: server,
            start: start,
            end: end,
            durationMs: end - start,
            response: response,
            size: response.data.length,
        };
    }).catch((error) => {
        return { success: false, status: error };
    });
}