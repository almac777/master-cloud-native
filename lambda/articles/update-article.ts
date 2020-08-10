import {ARTICLE_PRIMARY_KEY, ARTICLES_DB_NAME, DYNAMO_DB_EXECUTION_ERROR, RESERVED_RESPONSE} from './constants';

const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: any = {}): Promise<any> => {

    if (!event.body) {
        return {statusCode: 400, body: 'invalid request, you are missing the parameter body'};
    }

    const editedItemId = event.pathParameters.id;
    if (!editedItemId) {
        return {statusCode: 400, body: 'invalid request, you are missing the path parameter id'};
    }

    const editedItem: any = typeof event.body == 'object' ? event.body : JSON.parse(event.body);
    const editedItemProperties = Object.keys(editedItem);
    if (!editedItem || editedItemProperties.length < 1) {
        return {statusCode: 400, body: 'invalid request, no arguments provided'};
    }

    const firstProperty = editedItemProperties.splice(0, 1);
    const params: any = {
        TableName: ARTICLES_DB_NAME,
        Key: {
            [ARTICLE_PRIMARY_KEY]: editedItemId
        },
        UpdateExpression: `set ${firstProperty} = :${firstProperty}`,
        ExpressionAttributeValues: {},
        ReturnValues: 'UPDATED_NEW'
    }
    params.ExpressionAttributeValues[`:${firstProperty}`] = editedItem[`${firstProperty}`];

    editedItemProperties.forEach(property => {
        params.UpdateExpression += `, ${property} = :${property}`;
        params.ExpressionAttributeValues[`:${property}`] = editedItem[property];
    });

    try {
        await db.update(params).promise();
        return {statusCode: 204, body: ''};
    } catch (dbError) {
        const errorResponse = dbError.code === 'ValidationException' && dbError.message.includes('reserved keyword') ?
            DYNAMO_DB_EXECUTION_ERROR : RESERVED_RESPONSE;
        return {statusCode: 500, body: errorResponse};
    }
};
