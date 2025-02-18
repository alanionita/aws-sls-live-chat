import { formatJSONResponse } from "@libs/apiGw";
import { APIGatewayProxyEvent } from "aws-lambda";
import { dynamo } from "@libs/dynamo";
import { websocket } from "@libs/websocket";
import { UserConnRecord } from "src/types/dynamo";

export async function handler(event: APIGatewayProxyEvent) {
    try {
        const tableName = process.env?.ROOM_CONN_TABLE;

        if (!tableName) throw Error('Table name value cannot be found!')

        const { message } = JSON.parse(event.body);

        const { connectionId, domainName, stage } = event.requestContext

        if (!message) {
            await websocket.send({
                data: {
                    message: 'message request requires a "message" payload',
                    type: 'err'
                },
                connectionId,
                domainName,
                stage
            })
            return formatJSONResponse({})
        }

        const user = await dynamo.get<UserConnRecord>(connectionId, tableName);

        if (!user) {
            await websocket.send({
                data: {
                    message: 'user could not be found, please create or join a room',
                    type: 'err'
                },
                connectionId,
                domainName,
                stage
            })
            return formatJSONResponse({})
        }

        const { name, roomId } = user;

        const roomUsers = await dynamo.query<UserConnRecord>({
            tableName,
            index: 'index1',
            pkValue: roomId
        })

        const wsClient = websocket.createClient(domainName,stage);

        const messagePromiseArr = roomUsers.filter(targetUser => targetUser.id !== user.id).map(user => {
            const { id: connectionId } = user;

            return websocket.send({
                data: {
                    message,
                    from: user.name
                },
                connectionId,
                client: wsClient
            })
        })

        await Promise.all(messagePromiseArr);
    } catch (err) {
        console.error(err.message)
        console.info(JSON.stringify(err.stack))
        return formatJSONResponse({
            statusCode: 502,
            data: {
                message: err.message
            }
        })
    }
}
