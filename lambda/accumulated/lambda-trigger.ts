import {ACCUMULATED_DB_NAME, ACCUMULATED_PRIMARY_KEY} from './constants';

const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();

const RESERVED_RESPONSE = `Error: You're using AWS reserved keywords as attributes`,
    DYNAMODB_EXECUTION_ERROR = `Error: Execution update, caused a Dynamodb error, please take a look at your CloudWatch Logs.`;

interface Record {
    readonly eventID: string;
    readonly eventName: string;
    readonly eventVersion: string;
    readonly eventSource: string;
    readonly awsRegion: string;
    readonly dynamodb: any;
    readonly eventSourceARN: string;
}

export const handler = async (event: any = {}): Promise<any> => {
    console.log('event', event);
    if (event && event.Records) {
        console.log('dynamodb', event.Records[0].dynamodb);
        for (let i = 0; i < event.Records.length; i++) {
            let record: Record = event.Records[i];
            console.log('record', record);

            // Only inserts are currently supported
            if (record.eventName !== 'INSERT') {
                console.error('This event is broken: ', event, event.Records[0].dynamodb);
                continue;
            }

            let articleId = record.dynamodb.NewImage.article_id.S;
            let rating = record.dynamodb.NewImage.rating.S;

            if (!rating) {
                rating = record.dynamodb.NewImage.rating.N;
            }

            let params = {
                TableName: ACCUMULATED_DB_NAME,
                Key: {
                    [ACCUMULATED_PRIMARY_KEY]: articleId,
                }
            };

            let item = null;
            try {
                const response = await db.get(params).promise();
                item = response.Item;
            } catch (e) {
                console.error('reading issue! ', e)
                throw e;
            }

            if (!item) {
                // new
                item = {article_id: articleId, rating: rating, amount: 1};
            } else {
                let tmp = +item.rating;
                tmp = (+tmp * +item.amount) + (+rating);
                item.amount++;
                item.rating = tmp / item.amount;
            }

            try {
                const writeParams = {
                    TableName: ACCUMULATED_DB_NAME,
                    Item: item
                };
                await db.put(writeParams).promise();
            } catch (e) {
                throw e;
            }
        }
    }

};
