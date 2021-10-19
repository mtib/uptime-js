import axios from "axios";

export const checkUptimeAll = (servers) => {
    return Promise.allSettled(servers.map(checkUptimeEntry))
}
export const checkUptimeEntry = (server) => {
    return axios({
        url: server?.url,
        method: server?.method,
        data: server?.payload,
        validateStatus: undefined,
    }).then((response) => {
        return { success: (server?.status ? (status) => { 
            return server?.status.includes(status); 
        } : (status) => {
            return status >= 200 && status < 300; 
        })(response.status), status: response.status };
    }).catch((error) => {
        return { success: false, status: error };
    });
}