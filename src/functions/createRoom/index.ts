import { formatJSONResponse } from "@libs/apiGw";
import { APIGatewayProxyEvent } from "aws-lambda";
import { ulid } from 'ulid'
import { dynamo } from "@libs/dynamo";
import { UserConnRecord } from "src/types/dynamo";

export async function handler(event: APIGatewayProxyEvent) {
    try {
        const tableName = process.env?.ROOM_CONN_TABLE;

        if (!tableName) throw Error('Table name value cannot be found!')

        const body = JSON.parse(event.body);

        const { connectionId, domainName, stage } = event.requestContext

        if (!body.name) {
            await websocket.send({
                data: {
                    message: 'createRoom request requires a "name"',
                    type: 'err'
                }
            })
            return formatJSONResponse({})
        }

        const roomId = ulid().slice(0,8) 


        // Define DDB record
        const data: UserConnRecord = {
            id: connectionId,
            pk: roomId,
            sk: connectionId,
            name: body.name,
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
            }
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
