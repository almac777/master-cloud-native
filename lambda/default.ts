export const handler = async (event: any = {}) : Promise <any> => {
    console.log("request:", JSON.stringify(event, undefined, 2));
    return {
        statusCode: 404,
        body: 'Not found'
    };
};
