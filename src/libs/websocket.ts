import { ApiGatewayManagementApiClient, PostToConnectionCommand, PostToConnectionCommandInput } from "@aws-sdk/client-apigatewaymanagementapi"

interface IWebSocketSend {
    data: {
        message?: string
        type?: string
        from?: string
    },
    connectionId: string
    domainName?: string,
    stage?: string,
    client?: ApiGatewayManagementApiClient
}

export const websocket = {
    createClient: (domainName: string, stage: string) => {
        if (!domainName || !stage) {
            throw Error('domainName or stage is required for websocket client creation')
        }
        const client = new ApiGatewayManagementApiClient({
            endpoint: `https://${domainName}/${stage}`
        })
        return client;
    },
    send: ({ data, connectionId, domainName, stage, client }: IWebSocketSend) => {
        if (!client) {
            client = websocket.createClient(domainName, stage)
        }

        const params: PostToConnectionCommandInput = {
            ConnectionId: connectionId,
            Data: JSON.stringify(data)
        }

        const command = new PostToConnectionCommand(params)

        return client.send(command)
    }
}