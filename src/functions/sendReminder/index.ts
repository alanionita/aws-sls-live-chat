import { DynamoDBStreamEvent } from "aws-lambda";
import { unmarshall } from "@aws-sdk/util-dynamodb"
import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { SESClient, SendEmailCommand, SendEmailCommandInput } from '@aws-sdk/client-ses';
import { PublishCommand, PublishCommandInput, SNSClient } from "@aws-sdk/client-sns";

const sesClient = new SESClient();
const snsClient = new SNSClient();

export async function handler(event: DynamoDBStreamEvent) {
    try {
        const sesSenderAddr = process.env?.SES_ADDR || null;
        if (!sesSenderAddr) {
            throw Error('Error (env): SES sender address not found')
        }

        const reminderPromises = event.Records.map(async record => {
            const data = unmarshall(record.dynamodb.OldImage as Record<string, AttributeValue>)
            const { email, phoneNo, reminder } = data;
            if (phoneNo) {
                await sendSMS(phoneNo, reminder);
            }
            if (email) {
                await sendEmail({ email, reminder, fromAddress: sesSenderAddr });
            }
        })
        await Promise.all(reminderPromises)
    } catch (err) {
        console.error(err.message)
        console.info(JSON.stringify(err.stack))
    }
}

async function sendEmail({ email, reminder, fromAddress }: { email: string, reminder: string, fromAddress: string }) {
    const params: SendEmailCommandInput = {
        Source: fromAddress,
        Destination: {
            ToAddresses: [email]
        },
        Message: {
            Body: {
                Text: {
                    Charset: 'UTF-8',
                    Data: reminder
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: "ReminderApp: Your reminder ->"
            }
        }
    }

    const command = new SendEmailCommand(params);

    const res = await sesClient.send(command);

    return res.MessageId
}

async function sendSMS(phoneNo: string, reminder: string) {

    const params: PublishCommandInput = {
        Message: reminder,
        PhoneNumber: phoneNo
    }

    const command = new PublishCommand(params);

    const res = await snsClient.send(command);

    return res.MessageId
}