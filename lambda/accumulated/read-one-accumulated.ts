const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
import {ACCUMULATED_DB_NAME, ACCUMULATED_PRIMARY_KEY} from './constants';

export const handler = async (event: any = {}) : Promise <any> => {
    const requestedItemId = event.pathParameters.id;
    if (!requestedItemId) {
        return { statusCode: 400, body: `Error: You are missing the path parameter id` };
    }

    const params = {
        TableName: ACCUMULATED_DB_NAME,
        Key: {
            [ ACCUMULATED_PRIMARY_KEY ]: requestedItemId
        }
    };

    try {
        const response = await db.get(params).promise();
        return { statusCode: 200, body: JSON.stringify(response.Item) };
    } catch (dbError) {
        return { statusCode: 500, body: JSON.stringify(dbError) };
    }
};
