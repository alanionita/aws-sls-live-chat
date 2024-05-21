import type { AWS } from '@serverless/typescript';

const dynamoResources: AWS['resources']['Resources'] = {
    roomConnTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
            TableName: '${self:custom.roomConnTable}',
            AttributeDefinitions: [{
                AttributeName: 'id',
                AttributeType: 'S'
            },
            {
                AttributeName: 'pk',
                AttributeType: 'S'
            },
            {
                AttributeName: 'sk',
                AttributeType: 'S'
            }],
            KeySchema: [
                {
                    AttributeName: 'id',
                    KeyType: 'HASH'
                }
            ],
            BillingMode: 'PAY_PER_REQUEST',
            GlobalSecondaryIndexes: [
                {
                    IndexName: 'index1',
                    KeySchema: [
                        {
                            AttributeName: 'pk',
                            KeyType: 'HASH'
                        },
                        {
                            AttributeName: 'sk',
                            KeyType: 'RANGE'
                        }
                    ],
                    Projection: {
                        ProjectionType: 'ALL'
                    }
                },
            ],

            Tags: [{ Key: 'For', Value: 'sam-course' }, { Key: 'Date', Value: '2024-04-29' }, { Key: 'CanIDelete', Value: 'Yes' }, { Key: 'Author', Value: 'Alan' }]
        }
    },
}

export default dynamoResources;