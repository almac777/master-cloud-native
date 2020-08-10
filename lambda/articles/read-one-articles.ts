const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
import {ARTICLE_PRIMARY_KEY, ARTICLES_DB_NAME} from './constants';

export const handler = async (event: any = {}) : Promise <any> => {
    const requestedItemId = event.pathParameters.id;
    console.log(`=> ARTICLE PRIMARY KEY ${requestedItemId}`);
    if (!requestedItemId) {
        return { statusCode: 400, body: `Error: You are missing the path parameter id` };
    }
    console.log('params before');
    const params = {
        TableName: ARTICLES_DB_NAME,
        Key: {
            [ ARTICLE_PRIMARY_KEY ]: requestedItemId
        }
    };
    console.log(params);
    try {
        console.log('trying');
        const response = await db.get(params).promise();
        console.log('response promise after');
        console.log(response);
        return { statusCode: 200, body: JSON.stringify(response.Item) };
    } catch (dbError) {
        console.log(dbError);
        return { statusCode: 500, body: JSON.stringify(dbError) };
    }
};
