import axios from "axios";

export const checkUptimeAll = (servers) => {
    return Promise.allSettled(servers.map(checkUptimeEntry))
}
export const checkUptimeEntry = (server) => {
    return axios({
        url: server?.url,
        method: server?.method,
        data: server?.payload,
        validateStatus: server?.status ? (status) => { return server?.status.includes(status); } : undefined,
    }).then((response) => {
        return { success: true, status: response.status };
    }).catch((error) => {
        return { success: false, status: error.status };
    });
}