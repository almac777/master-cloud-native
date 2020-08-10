import {RATING_PRIMARY_KEY, RATINGS_DB_NAME} from './constants';

const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
import { uuid } from 'uuidv4';

const RESERVED_RESPONSE = `Error: You're using AWS reserved keywords as attributes`,
    DYNAMODB_EXECUTION_ERROR = `Error: Execution update, caused a Dynamodb error, please take a look at your CloudWatch Logs.`;

export const handler = async (event: any = {}) : Promise <any> => {
    if (!event.body) {
        return { statusCode: 400, body: 'invalid request, you are missing the parameter body' };
    }
    const item = typeof event.body == 'object' ? event.body : JSON.parse(event.body);
    item[RATING_PRIMARY_KEY] = uuid();
    const params = {
        TableName: RATINGS_DB_NAME,
        Item: item
    };

    try {
        const x = await db.put(params).promise();
        console.log('item: ', item);
        console.log('ret: ', x);
        return { statusCode: 201, body: JSON.stringify(item)};
    } catch (dbError) {
        const errorResponse = dbError.code === 'ValidationException' && dbError.message.includes('reserved keyword') ?
            DYNAMODB_EXECUTION_ERROR : RESERVED_RESPONSE;
        return { statusCode: 500, body: errorResponse };
    }
};
