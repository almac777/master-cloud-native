const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
import {RATING_SORT_KEY, RATING_PRIMARY_KEY, RATINGS_DB_NAME} from './constants';

export const handler = async (event: any = {}) : Promise <any> => {
    const requestedItemId = event.pathParameters.id;
    const articleId = event.pathParameters.article_id;
    if (!requestedItemId) {
        return { statusCode: 400, body: `Error: You are missing the path parameter id` };
    }

    const params = {
        TableName: RATINGS_DB_NAME,
        Key: {
            [ RATING_PRIMARY_KEY ]: requestedItemId,
            [ RATING_SORT_KEY ]: articleId
        }
    };

    try {
        const response = await db.get(params).promise();
        return { statusCode: 200, body: JSON.stringify(response.Item) };
    } catch (dbError) {
        return { statusCode: 500, body: JSON.stringify(dbError) };
    }
};
