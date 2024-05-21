import { DynamoDBClient, } from "@aws-sdk/client-dynamodb";
import { GetCommand, GetCommandInput, PutCommand, PutCommandInput, QueryCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb"

const ddbClient = new DynamoDBClient({});

export const dynamo = {
    write: async (data: Record<string, any>, tableName: string) => {

        const putParams: PutCommandInput = {
            TableName: tableName,
            Item: data
        };

        const command = new PutCommand(putParams);

        await ddbClient.send(command);

        return data;
    },
    get: async (id: string, tableName: string) => {

        const getParams: GetCommandInput = {
            TableName: tableName,
            Key: {
                id: id
            }
        };

        const command = new GetCommand(getParams);

        const res = await ddbClient.send(command);

        return res.Item;
    },
    query: async ({ tableName, index, pkValue, pkKey = 'pk', skValue, skKey = 'sk', sortAscending = true }: { tableName: string, index: string, pkValue: string, pkKey?: string, skValue?: string, skKey?: string, sortAscending?: boolean }) => {

        const skExp = skValue ? `AND ${skKey} = :rangeValue` : ''

        const params: QueryCommandInput = {
            TableName: tableName,
            IndexName: index,
            KeyConditionExpression: `${pkKey} = :hashValue ${skExp}`,
            ExpressionAttributeValues: {
                ':hashValue': pkValue,
            },
            ScanIndexForward: sortAscending
        }

        if (skValue) {
            params.ExpressionAttributeValues[':rangeValue'] = skValue
        }

        const command = new QueryCommand(params);

        const res = await ddbClient.send(command);

        return res.Items;
    }
}