import { formatJSONResponse } from "@libs/apiGw";
import { APIGatewayProxyEvent } from "aws-lambda";
import { dynamo } from "@libs/dynamo";

export async function handler(event: APIGatewayProxyEvent) {
    try {
        const tableName = process.env?.ROOM_CONN_TABLE;
        const GSI_NAME = 'index1';

        if (!tableName) throw Error('Table name value cannot be found!')

        const { userId } = event.pathParameters || {}

        if (!userId) {
            return formatJSONResponse({
                statusCode: 400,
                data: {
                    message: 'Missing userId in path'
                }
            })
        }

        const data = await dynamo.query({ tableName, index: GSI_NAME, pkValue: userId });


        return formatJSONResponse({
            data,
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
