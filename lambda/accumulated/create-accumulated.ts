import {ACCUMULATED_DB_NAME, ACCUMULATED_PRIMARY_KEY} from './constants';

const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const {"v4": uuid} = require('uuid');

const RESERVED_RESPONSE = `Error: You're using AWS reserved keywords as attributes`,
    DYNAMODB_EXECUTION_ERROR = `Error: Execution update, caused a Dynamodb error, please take a look at your CloudWatch Logs.`;

export const handler = async (event: any = {}) : Promise <any> => {
    if (!event.body) {
        return { statusCode: 400, body: 'invalid request, you are missing the parameter body' };
    }
    const id = uuid();
    const item = typeof event.body == 'object' ? event.body : JSON.parse(event.body);
    item[ACCUMULATED_PRIMARY_KEY] = id;
    const params = {
        TableName: ACCUMULATED_DB_NAME,
        Item: item
    };

    try {
        await db.put(params).promise();
        return { statusCode: 201, body: '' };
    } catch (dbError) {
        const errorResponse = dbError.code === 'ValidationException' && dbError.message.includes('reserved keyword') ?
            DYNAMODB_EXECUTION_ERROR : RESERVED_RESPONSE;
        return { statusCode: 500, body: errorResponse };
    }
};
