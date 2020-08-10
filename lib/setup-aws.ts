import cdk = require('@aws-cdk/core');
import lambda = require('@aws-cdk/aws-lambda');
import dynamodb = require('@aws-cdk/aws-dynamodb');
import cognito = require('@aws-cdk/aws-cognito');
import apigateway = require('@aws-cdk/aws-apigateway');
import {Construct, Duration, RemovalPolicy} from '@aws-cdk/core';
import {
    AuthorizationType,
    CfnAuthorizer,
    CfnAuthorizerProps,
    IAuthorizer,
    LambdaIntegration
} from '@aws-cdk/aws-apigateway';
import {ARTICLE_PRIMARY_KEY, ARTICLES_DB_NAME} from '../lambda/articles/constants';
import {RATING_PRIMARY_KEY, RATING_SORT_KEY, RATINGS_DB_NAME} from '../lambda/ratings/constants';
import {ACCUMULATED_DB_NAME} from '../lambda/accumulated/constants';
import {OAuthScope} from '@aws-cdk/aws-cognito';

// https://github.com/aws/aws-cdk/issues/5618
export class CognitoApiGatewayAuthorizer extends CfnAuthorizer implements IAuthorizer {
    public readonly authorizerId: string

    constructor(scope: Construct, id: string, props: CfnAuthorizerProps) {
        super(scope, id, props)

        this.authorizerId = this.ref
    }
}

export const createStack = async (scope: cdk.Construct, id: string, props?: cdk.StackProps) => {
    const stack = new cdk.Stack(scope, id, props);

    // --------------------- Cognito ---------------------

    const userPool = new cognito.UserPool(stack, 'userpool', {
        userPoolName: 'rating-userpool',
        signInAliases: {
            username: true,
            email: true
        },
        passwordPolicy: {
            minLength: 8,
            requireLowercase: true,
            requireUppercase: true,
            requireDigits: true,
            requireSymbols: true,
            tempPasswordValidity: Duration.days(3)
        },
    });
    const userPoolId = userPool.userPoolId;
    const appIdentifier = 'fh-campus-rating-rs';
    const masterCustomScope = 'master';
    const customScopeName = `${appIdentifier}/${masterCustomScope}`;
    const userPoolResourceServer = new cognito.CfnUserPoolResourceServer(userPool, 'rating-userpool-resourceserver', {
        name: 'userpool-resource-server',
        userPoolId: userPoolId,
        identifier: 'fh-campus-rating-rs',
        scopes: [{
            scopeName: masterCustomScope,
            scopeDescription: 'master key - usually not a good idea, for demonstration purposes only!'
        } as cognito.CfnUserPoolResourceServer.ResourceServerScopeTypeProperty]
    });
    const userPoolClient = new cognito.CfnUserPoolClient(userPool, 'user-pool-app-client', {
        userPoolId: userPoolId,
        clientName: 'rating-app-client',
        // according to => https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-cognito-userpoolclient.html#cfn-cognito-userpoolclient-allowedoauthflows
        allowedOAuthFlows: ['client_credentials'],
        allowedOAuthScopes: [ customScopeName ],
        allowedOAuthFlowsUserPoolClient: true,
        generateSecret: true
    } as cognito.CfnUserPoolClientProps);

    userPoolClient.addDependsOn(userPoolResourceServer);

    userPool.addDomain('cognito-domain', {
        cognitoDomain: {
            domainPrefix: 'fh-campus-rating-app-auth'
        }
    });

    const defaultHandler = new lambda.Function(stack, 'default', {
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: 'default.handler',
        code: lambda.Code.fromAsset('./lambda'),
    });

    // --------------------- read all ---------------------

    const readAllArticlesHandler = new lambda.Function(stack, 'read-all-articles', {
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: 'read-all-articles.handler',
        code: lambda.Code.fromAsset('./lambda/articles'),
        tracing: lambda.Tracing.ACTIVE
    });

    const readAllRatingsHandler = new lambda.Function(stack, 'read-all-ratings', {
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: 'read-all-ratings.handler',
        code: lambda.Code.fromAsset('./lambda/ratings'),
        tracing: lambda.Tracing.ACTIVE
    });

    const readAllAccumulatedHandler = new lambda.Function(stack, 'read-all-accumulated', {
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: 'read-all-accumulated.handler',
        code: lambda.Code.fromAsset('./lambda/accumulated'),
        tracing: lambda.Tracing.ACTIVE
    });

    // --------------------- read one ---------------------

    const readOneArticleHandler = new lambda.Function(stack, 'read-one-article', {
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: 'read-one-articles.handler',
        code: lambda.Code.fromAsset('./lambda/articles'),
        tracing: lambda.Tracing.ACTIVE
    });

    const readOneRatingHandler = new lambda.Function(stack, 'read-one-rating', {
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: 'read-one-ratings.handler',
        code: lambda.Code.fromAsset('./lambda/ratings'),
        tracing: lambda.Tracing.ACTIVE
    });

    const readOneAccumulatedHandler = new lambda.Function(stack, 'read-one-accumulated', {
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: 'read-one-accumulated.handler',
        code: lambda.Code.fromAsset('./lambda/accumulated'),
        tracing: lambda.Tracing.ACTIVE
    });

    // --------------------- create ---------------------

    const createArticleHandler = new lambda.Function(stack, 'create-article', {
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: 'create-article.handler',
        code: lambda.Code.fromAsset('./lambda/articles'),
        tracing: lambda.Tracing.ACTIVE
    });

    const createRatingHandler = new lambda.Function(stack, 'create-rating', {
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: 'create-rating.handler',
        code: lambda.Code.fromAsset('./lambda/ratings'),
        tracing: lambda.Tracing.ACTIVE
    });

    const createAccumulatedHandler = new lambda.Function(stack, 'create-accumulated', {
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: 'create-accumulated.handler',
        code: lambda.Code.fromAsset('./lambda/accumulated'),
        tracing: lambda.Tracing.ACTIVE
    });

    // --------------------- update ---------------------

    const updateArticleHandler = new lambda.Function(stack, 'update-article', {
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: 'update-article.handler',
        code: lambda.Code.fromAsset('./lambda/articles'),
        tracing: lambda.Tracing.ACTIVE
    });

    const updateRatingHandler = new lambda.Function(stack, 'update-rating', {
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: 'update-rating.handler',
        code: lambda.Code.fromAsset('./lambda/ratings'),
        tracing: lambda.Tracing.ACTIVE
    });

    const updateAccumulatedHandler = new lambda.Function(stack, 'update-accumulated', {
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: 'update-accumulated.handler',
        code: lambda.Code.fromAsset('./lambda/accumulated'),
        tracing: lambda.Tracing.ACTIVE
    });

    // --------------------- delete ---------------------

    const deleteArticleHandler = new lambda.Function(stack, 'delete-article', {
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: 'delete-article.handler',
        code: lambda.Code.fromAsset('./lambda/articles'),
        tracing: lambda.Tracing.ACTIVE
    });

    const deleteRatingHandler = new lambda.Function(stack, 'delete-rating', {
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: 'delete-rating.handler',
        code: lambda.Code.fromAsset('./lambda/ratings'),
        tracing: lambda.Tracing.ACTIVE
    });

    const deleteAccumulatedHandler = new lambda.Function(stack, 'delete-accumulated', {
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: 'delete-accumulated.handler',
        code: lambda.Code.fromAsset('./lambda/accumulated'),
        tracing: lambda.Tracing.ACTIVE
    });


    // lambdas finished

    const articlesDb = new dynamodb.Table(stack, ARTICLES_DB_NAME, {
        tableName: ARTICLES_DB_NAME,
        partitionKey: {
            name: ARTICLE_PRIMARY_KEY, type: dynamodb.AttributeType.STRING
        },
        stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
        removalPolicy: RemovalPolicy.DESTROY
    });

    const ratingsDb = new dynamodb.Table(stack, RATINGS_DB_NAME, {
        tableName: RATINGS_DB_NAME,
        partitionKey: {
            name: RATING_PRIMARY_KEY, type: dynamodb.AttributeType.STRING
        },
        sortKey: {
            name: RATING_SORT_KEY, type: dynamodb.AttributeType.STRING
        },
        stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
        removalPolicy: RemovalPolicy.DESTROY
    });

    const accumulatedDb = new dynamodb.Table(stack, ACCUMULATED_DB_NAME, {
        tableName: ACCUMULATED_DB_NAME,
        partitionKey: {
            name: ARTICLE_PRIMARY_KEY, type: dynamodb.AttributeType.STRING
        },
        stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
        removalPolicy: RemovalPolicy.DESTROY
    });

    // sets rights to the lambdas
    articlesDb.grantReadData(readAllArticlesHandler);
    ratingsDb.grantReadData(readAllRatingsHandler);
    accumulatedDb.grantReadData(readAllAccumulatedHandler);

    articlesDb.grantReadData(readOneArticleHandler);
    ratingsDb.grantReadData(readOneRatingHandler);
    accumulatedDb.grantReadData(readOneAccumulatedHandler);

    articlesDb.grantWriteData(createArticleHandler);
    ratingsDb.grantWriteData(createRatingHandler);
    accumulatedDb.grantWriteData(createAccumulatedHandler);

    articlesDb.grantReadWriteData(updateArticleHandler);
    ratingsDb.grantReadWriteData(updateRatingHandler);
    accumulatedDb.grantReadWriteData(updateAccumulatedHandler);

    articlesDb.grantReadWriteData(deleteArticleHandler);
    ratingsDb.grantReadWriteData(deleteRatingHandler);
    accumulatedDb.grantReadWriteData(deleteAccumulatedHandler);

    // create a gateway
    const apiGateway = new apigateway.LambdaRestApi(stack, 'fh-campus-master-api-gateway', {
        handler: defaultHandler,
        proxy: false,

    });

    // create an authorizer for the api gateway
    // https://stackoverflow.com/a/52730089/2846307
    const authorizer = new CognitoApiGatewayAuthorizer(stack, 'fh-campus-api-gw-authorizer', {
        name: 'CognitoAuthorizer',
        restApiId: apiGateway.restApiId,
        authorizerResultTtlInSeconds: 300,
        identitySource: 'method.request.header.Authorization',
        providerArns: [ userPool.userPoolArn ],
        type: AuthorizationType.COGNITO
    });

    // add the api & versions
    const api = apiGateway.root.addResource('api');
    const v1 = api.addResource('v1')
    const articlesV1 = v1.addResource('articles');
    // handle v1 apis
    const ratingsV1 = v1.addResource('ratings');
    const accumulatedV1 = v1.addResource('accumulated');

    const methodOption = {
        authorizationType: AuthorizationType.COGNITO,
        authorizer: authorizer,
        authorizationScopes: [ customScopeName ]
    };

    // create methods
    articlesV1.addMethod('POST', new LambdaIntegration(createArticleHandler), methodOption);
    ratingsV1.addMethod('POST', new LambdaIntegration(createRatingHandler), methodOption);
    accumulatedV1.addMethod('POST', new LambdaIntegration(createAccumulatedHandler), methodOption)

    // read methods
    articlesV1.addMethod('GET', new LambdaIntegration(readAllArticlesHandler), methodOption);
    ratingsV1.addMethod('GET', new LambdaIntegration(readAllRatingsHandler), methodOption);
    accumulatedV1.addMethod('GET', new LambdaIntegration(readAllAccumulatedHandler), methodOption);

    // with ID
    const oneArticle = articlesV1.addResource('{id}');
    const oneRating = ratingsV1.addResource('{id}').addResource(`{${ARTICLE_PRIMARY_KEY}}`);
    const oneAccumulated = accumulatedV1.addResource('{id}');

    // read one methods
    oneArticle.addMethod('GET', new LambdaIntegration(readOneArticleHandler), methodOption);
    oneRating.addMethod('GET', new LambdaIntegration(readOneRatingHandler), methodOption);
    oneAccumulated.addMethod('GET', new LambdaIntegration(readOneAccumulatedHandler), methodOption);

    // update methods
    oneArticle.addMethod('PUT', new LambdaIntegration(updateArticleHandler), methodOption);
    oneRating.addMethod('PUT', new LambdaIntegration(updateRatingHandler), methodOption);
    oneAccumulated.addMethod('PUT', new LambdaIntegration(updateAccumulatedHandler), methodOption);

    oneArticle.addMethod('PATCH', new LambdaIntegration(updateArticleHandler), methodOption);
    oneRating.addMethod('PATCH', new LambdaIntegration(updateRatingHandler), methodOption);
    oneAccumulated.addMethod('PATCH', new LambdaIntegration(updateAccumulatedHandler), methodOption);

    // delete methods
    oneArticle.addMethod('DELETE', new LambdaIntegration(deleteArticleHandler), methodOption);
    oneRating.addMethod('DELETE', new LambdaIntegration(deleteRatingHandler), methodOption);
    oneAccumulated.addMethod('DELETE', new LambdaIntegration(deleteAccumulatedHandler), methodOption);

}
