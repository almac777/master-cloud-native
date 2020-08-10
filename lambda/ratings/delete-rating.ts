import {RATING_SORT_KEY, RATING_PRIMARY_KEY, RATINGS_DB_NAME} from './constants';

const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: any = {}) : Promise <any> => {
    const requestedItemId = event.pathParameters.id;
    const articleId = event.pathParameters[RATING_SORT_KEY];
    if (!requestedItemId) {
        return { statusCode: 400, body: `Error: You are missing the path parameter id` };
    }
    if (!articleId) {
        return { statusCode: 400, body: `Error: You are missing the path parameter articleId` };
    }

    const params = {
        TableName: RATINGS_DB_NAME,
        Key: {
            [RATING_PRIMARY_KEY]: requestedItemId,
            [RATING_SORT_KEY]: articleId
        }
    };

    try {
        await db.delete(params).promise();
        return { statusCode: 200, body: '' };
    } catch (dbError) {
        return { statusCode: 500, body: JSON.stringify(dbError) };
    }
};
