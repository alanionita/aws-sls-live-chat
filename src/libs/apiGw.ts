interface IFormatJSONResponseInput { statusCode?: number, data?: any, headers?: Record<string, string> }

export function formatJSONResponse({ statusCode = 200, data = {}, headers = {}}: IFormatJSONResponseInput) {
    return {
        statusCode,
        body: JSON.stringify(data),
        headers: {
            'Access-Control-Allow-Origin': "*",
            'Access-Control-Allow-Credentials': true,
            ...headers
        }
    }
}