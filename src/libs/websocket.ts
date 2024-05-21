import { ApiGatewayManagementApiClient, PostToConnectionCommand, PostToConnectionCommandInput } from "@aws-sdk/client-apigatewaymanagementapi"

interface IWebSocketSend {
    data: {
        message?: string
        type?:string
        from?: string
    },
    connectionId: string
    domainName: string,
    stage: string
}

export const websocket = {
    send: ({data, connectionId, domainName, stage}: IWebSocketSend) => {
        const client = new ApiGatewayManagementApiClient({
            endpoint: `https://${domainName}/${stage}`
        })

        const params: PostToConnectionCommandInput = {
            ConnectionId: connectionId,
            Data: JSON.stringify(data)
        }

        const command = new PostToConnectionCommand(params)

        return client.send(command)
    }
}