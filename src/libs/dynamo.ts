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
    get: async <T = Record<string, any>>(id: string, tableName: string) => {

        const getParams: GetCommandInput = {
            TableName: tableName,
            Key: {
                id: id
            }
        };

        const command = new GetCommand(getParams);

        const res = await ddbClient.send(command);

        return res.Item as T;
    },
    query: async <T = Record<string, any>>({ tableName, index, pkValue, pkKey = 'pk', skValue, skKey = 'sk', sortAscending = true, limit}: { tableName: string, index: string, pkValue: string, pkKey?: string, skValue?: string, skKey?: string, sortAscending?: boolean, limit?: number }) => {

        const skExp = skValue ? `AND ${skKey} = :rangeValue` : ''

        const params: QueryCommandInput = {
            TableName: tableName,
            IndexName: index,
            KeyConditionExpression: `${pkKey} = :hashValue ${skExp}`,
            ExpressionAttributeValues: {
                ':hashValue': pkValue,
            },
            ScanIndexForward: sortAscending,
            Limit: limit
        }

        if (skValue) {
            params.ExpressionAttributeValues[':rangeValue'] = skValue
        }

        const command = new QueryCommand(params);

        const res = await ddbClient.send(command);

        return res.Items as T[];
    }
}