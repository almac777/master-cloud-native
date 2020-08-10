import {ACCUMULATED_DB_NAME} from './constants';

const aws = require('aws-sdk');
const db = new aws.DynamoDB.DocumentClient();

export const handler = async(event: any = {}) : Promise <any> => {
    const searchParams = { TableName: ACCUMULATED_DB_NAME };
    console.log('request:', JSON.stringify(event, undefined, 2));
    try {
        const response = await db.scan(searchParams).promise();
        return { statusCode: 200, body: JSON.stringify(response.Items) };
    } catch (dbError) {
        return { statusCode: 500, body: JSON.stringify(dbError)};
    }
};
