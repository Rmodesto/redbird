import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets = from 'aws-cdk-lib/aws-route53-targets';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import { Construct } from 'constructs';

export class SubwaySoundsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 Bucket for static website hosting
    const websiteBucket = new s3.Bucket(this, 'SubwaySoundsWebsiteBucket', {
      bucketName: `subway-sounds-website-${this.account}`,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'error.html',
      publicReadAccess: false, // We'll use CloudFront for public access
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For development - change for production
      autoDeleteObjects: true, // For development - change for production
    });

    // Lambda function for API routes (Next.js API routes)
    const apiLambda = new lambda.Function(this, 'SubwaySoundsApiFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../.next/standalone/api'),
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        NODE_ENV: 'production',
        NEXT_PUBLIC_SITE_URL: 'https://subwaysounds.nyc',
      },
    });

    // API Gateway for Lambda
    const api = new apigateway.RestApi(this, 'SubwaySoundsApi', {
      restApiName: 'Subway Sounds API',
      description: 'API for Subway Sounds NYC application',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key'],
      },
    });

    // API Gateway Lambda Integration
    const lambdaIntegration = new apigateway.LambdaIntegration(apiLambda, {
      requestTemplates: { 'application/json': '{ "statusCode": "200" }' },
    });

    // API Routes
    const apiResource = api.root.addResource('api');
    
    // Stations API
    const stationsResource = apiResource.addResource('subway-stations');
    stationsResource.addMethod('GET', lambdaIntegration);
    
    // Trains API
    const trainsResource = apiResource.addResource('subway-trains');
    trainsResource.addMethod('GET', lambdaIntegration);
    trainsResource.addMethod('POST', lambdaIntegration);

    // Legacy API routes for compatibility
    const legacyStations = apiResource.addResource('stations');
    legacyStations.addMethod('GET', lambdaIntegration);
    
    const legacyArrivals = apiResource.addResource('arrivals');
    const arrivalsParam = legacyArrivals.addResource('{stationId}');
    arrivalsParam.addMethod('GET', lambdaIntegration);

    // CloudFront distribution
    const distribution = new cloudfront.Distribution(this, 'SubwaySoundsDistribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(websiteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        responseHeadersPolicy: cloudfront.ResponseHeadersPolicy.SECURITY_HEADERS,
        compress: true,
      },
      additionalBehaviors: {
        // API behavior
        '/api/*': {
          origin: new origins.RestApiOrigin(api),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          compress: true,
        },
        // Static assets caching
        '/_next/static/*': {
          origin: new origins.S3Origin(websiteBucket),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: new cloudfront.CachePolicy(this, 'StaticAssetsCachePolicy', {
            cachePolicyName: 'SubwayStaticAssets',
            defaultTtl: cdk.Duration.days(365),
            maxTtl: cdk.Duration.days(365),
            minTtl: cdk.Duration.days(365),
            headerBehavior: cloudfront.CacheHeaderBehavior.none(),
            queryStringBehavior: cloudfront.CacheQueryStringBehavior.none(),
            cookieBehavior: cloudfront.CacheCookieBehavior.none(),
          }),
          compress: true,
        },
        // Images and media caching
        '/images/*': {
          origin: new origins.S3Origin(websiteBucket),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: new cloudfront.CachePolicy(this, 'ImagesCachePolicy', {
            cachePolicyName: 'SubwayImages',
            defaultTtl: cdk.Duration.days(30),
            maxTtl: cdk.Duration.days(365),
            minTtl: cdk.Duration.seconds(1),
            headerBehavior: cloudfront.CacheHeaderBehavior.allowList('Accept'),
            queryStringBehavior: cloudfront.CacheQueryStringBehavior.none(),
            cookieBehavior: cloudfront.CacheCookieBehavior.none(),
          }),
          compress: true,
        },
      },
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(1),
        },
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(1),
        },
      ],
      comment: 'Subway Sounds NYC - Real-time 3D Subway Map',
      enableIpv6: true,
      enabled: true,
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100, // US, Canada, Europe
    });

    // S3 Deployment for static assets
    new s3deploy.BucketDeployment(this, 'SubwaySoundsDeployment', {
      sources: [s3deploy.Source.asset('../out')], // Next.js static export output
      destinationBucket: websiteBucket,
      distribution,
      distributionPaths: ['/*'],
      prune: true,
    });

    // Output the CloudFront URL
    new cdk.CfnOutput(this, 'CloudFrontURL', {
      value: distribution.distributionDomainName,
      description: 'CloudFront Distribution URL',
    });

    new cdk.CfnOutput(this, 'WebsiteURL', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'Website URL',
    });

    new cdk.CfnOutput(this, 'APIGatewayURL', {
      value: api.url,
      description: 'API Gateway URL',
    });
  }
}