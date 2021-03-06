import {ARTICLE_PRIMARY_KEY, ARTICLES_DB_NAME} from './constants';

const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: any = {}) : Promise <any> => {
    const requestedItemId = event.pathParameters.id;
    if (!requestedItemId) {
        return { statusCode: 400, body: `Error: You are missing the path parameter id` };
    }

    const params = {
        TableName: ARTICLES_DB_NAME,
        Key: {
            [ARTICLE_PRIMARY_KEY]: requestedItemId
        }
    };

    try {
        await db.delete(params).promise();
        return { statusCode: 200, body: '' };
    } catch (dbError) {
        return { statusCode: 500, body: JSON.stringify(dbError) };
    }
};
