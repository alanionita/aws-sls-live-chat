import { formatJSONResponse } from "@libs/apiGw";
import { APIGatewayProxyEvent } from "aws-lambda";
import { dynamo } from "@libs/dynamo";
import { websocket } from "@libs/websocket";
import { UserConnRecord } from "src/types/dynamo";

export async function handler(event: APIGatewayProxyEvent) {
    try {
        const tableName = process.env?.ROOM_CONN_TABLE;

        if (!tableName) throw Error('Table name value cannot be found!')

        const { name, roomId } = JSON.parse(event.body);

        const { connectionId, domainName, stage } = event.requestContext

        if (!name) {
            await websocket.send({
                data: {
                    message: 'joinRoom request requires a "name"',
                    type: 'err'
                },
                connectionId,
                domainName,
                stage
            })
            return formatJSONResponse({})
        }

        if (!roomId) {
            await websocket.send({
                data: {
                    message: 'joinRoom request requires a "roomId"',
                    type: 'err'
                },
                connectionId,
                domainName,
                stage
            })
            return formatJSONResponse({})
        }

        const userRoom = await dynamo.query({
            tableName: tableName,
            pkValue: roomId,
            index: 'index1',
            limit: 1
        })

        // Validate that rooms exists

        const roomExists = userRoom.length != 0;

        if (!roomExists) {
            await websocket.send({
                data: {
                    message: 'roomId not found, please create a room or pass a valid "roomId"',
                    type: 'err'
                },
                connectionId,
                domainName,
                stage
            })
            return formatJSONResponse({})
        }

        // Define DDB record
        const data: UserConnRecord = {
            id: connectionId,
            pk: roomId,
            sk: connectionId,
            name,
            domainName,
            stage,
            roomId
        }

        // Write DDB record
        await dynamo.write(data, tableName)

        // Send message back to user
        await websocket.send({
            data: {
                message: `Successfully connected to room ${roomId}`,
                type: 'info'
            },
            connectionId,
            domainName,
            stage
        })

        return formatJSONResponse({

        })
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
