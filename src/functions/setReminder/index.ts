import { formatJSONResponse } from "@libs/apiGw";
import { APIGatewayProxyEvent } from "aws-lambda";
import { ulid } from 'ulid'
import { dynamo } from "@libs/dynamo";

export async function handler(event: APIGatewayProxyEvent) {
    try {
        const tableName = process.env?.ROOM_CONN_TABLE;

        if (!tableName) throw Error('Table name value cannot be found!')

        const body = JSON.parse(event.body);

        const { email, phoneNo, reminder, reminderDate } = body

        const validationErrors = validateInputs({ email, phoneNo, reminder, reminderDate });

        if (validationErrors) {
            return validationErrors
        }

        const userId = email || phoneNo;

        const ddbData = {   
            ...body,
            id: ulid(),
            TTL: reminderDate / 1000,
            pk: userId,
            sk: reminderDate.toString()
        }

        await dynamo.write(ddbData, tableName);

        return formatJSONResponse({
            data: {
                message: `Reminder is set for ${new Date(reminderDate).toDateString()}`,
                id: ddbData.id
            },
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

function validateInputs({ email, phoneNo, reminder, reminderDate }: {
    email?: string, phoneNo?: string, reminder: string, reminderDate: string
}) {
     // TODO: validate email and phoneNo types etc
    if (!email && !phoneNo) {
        return formatJSONResponse({
            statusCode: 400,
            data: {
                message: 'Email or Phone Number required!'
            }
        })
    }

    if (!reminder) {
        return formatJSONResponse({
            statusCode: 400,
            data: {
                message: 'Reminder required!'
            }
        })
    }

    if (!reminderDate) {
        return formatJSONResponse({
            statusCode: 400,
            data: {
                message: 'Reminder date required!'
            }
        })
    }
    return;
}