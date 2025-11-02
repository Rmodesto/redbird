# 🚇 Subway Sounds NYC - Deployment Guide

## Real-Time 3D NYC Subway Map - AWS Deployment

This guide covers deploying your Next.js-based NYC subway map with real-time train tracking to AWS using CDK.

## 🏗️ Architecture Overview

- **Frontend**: Next.js static export hosted on S3
- **CDN**: CloudFront for global distribution and caching
- **API**: Lambda functions for real-time data endpoints
- **Database**: Station data stored in JSON files (easily upgradeable to DynamoDB)
- **Map**: MapLibre GL JS (no API keys required)

## ✅ Prerequisites

1. **AWS Account**: Free tier compatible
2. **AWS CLI**: Installed and configured
3. **Node.js**: Version 18 or higher
4. **CDK**: AWS CDK v2

```bash
# Install AWS CLI
brew install awscli  # macOS
# or download from https://aws.amazon.com/cli/

# Configure AWS CLI
aws configure

# Install CDK globally
npm install -g aws-cdk

# Bootstrap CDK (one time per account/region)
cdk bootstrap
```

## 🚀 Quick Deployment

### Option 1: One-Command Deploy
```bash
npm run deploy
```

### Option 2: Step by Step

1. **Install CDK Dependencies**:
```bash
npm run cdk:install
```

2. **Build & Export Next.js**:
```bash
npm run export
```

3. **Deploy to AWS**:
```bash
npm run cdk:deploy
```

## 📦 Deployment Features

### Static Website (S3 + CloudFront)
- **S3 Bucket**: Hosts static Next.js export
- **CloudFront**: Global CDN with custom caching policies
- **HTTPS**: Automatic SSL/TLS termination
- **Compression**: Gzip/Brotli for all assets

### API Gateway + Lambda
- **Real-time APIs**: 
  - `/api/subway-stations` - Station data
  - `/api/subway-trains` - Live train positions
- **Auto-scaling**: Handles traffic spikes automatically
- **Cold starts**: Optimized with 512MB memory allocation

### Caching Strategy
- **Static assets**: 365 days cache (versioned URLs)
- **HTML pages**: 1 day cache with revalidation
- **API responses**: 10 seconds cache for real-time data
- **Images**: 30 days cache with Accept header

## 🔧 Configuration

### Environment Variables
Set these in the CDK stack or Lambda environment:

```typescript
environment: {
  NODE_ENV: 'production',
  NEXT_PUBLIC_SITE_URL: 'https://your-domain.com',
  // Add MTA API keys here when ready for real data
  MTA_API_KEY: 'your-mta-api-key',
}
```

### Custom Domain (Optional)
To use a custom domain, update the CDK stack:

```typescript
// In cdk/lib/subway-sounds-stack.ts
const certificate = acm.Certificate.fromCertificateArn(
  this, 'Certificate', 
  'arn:aws:acm:us-east-1:ACCOUNT:certificate/CERT-ID'
);

const distribution = new cloudfront.Distribution(this, 'Distribution', {
  domainNames: ['subwaysounds.nyc'],
  certificate: certificate,
  // ... other config
});
```

## 📊 Cost Estimation (AWS Free Tier)

- **S3 Storage**: ~$0.023/GB/month (first 5GB free)
- **CloudFront**: First 1TB free, then ~$0.085/GB
- **Lambda**: First 1M requests free, then $0.20/1M requests
- **API Gateway**: First 1M requests free, then $3.50/1M requests

**Expected monthly cost**: $0-5 for typical usage

## 🔄 Updates & Maintenance

### Deploy Updates
```bash
npm run deploy
```

### Check Differences Before Deploy
```bash
npm run cdk:diff
```

### View CloudFormation Stack
```bash
aws cloudformation describe-stacks --stack-name SubwaySoundsStack
```

### Monitor Performance
- CloudWatch for Lambda metrics
- CloudFront real-time logs
- S3 access logs

## 🚨 Troubleshooting

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next out

# Rebuild
npm run build
```

### CDK Deployment Issues
```bash
# Check CDK version
cdk --version

# Re-bootstrap if needed
cdk bootstrap --force
```

### Lambda Function Errors
Check CloudWatch Logs in AWS Console:
```
AWS Console > CloudWatch > Log groups > /aws/lambda/SubwaySoundsApiFunction
```

## 🎯 Performance Optimization

### MapLibre GL Optimization
- Uses free map tiles (no API costs)
- Efficient vector tile caching
- WebGL acceleration

### Next.js Optimizations
- Static export for maximum performance
- Automatic code splitting
- Image optimization (when adding images)

### AWS Optimizations
- CloudFront edge locations worldwide
- Lambda@Edge for dynamic content
- S3 Transfer Acceleration available

## 🔒 Security Features

### CloudFront Security Headers
- HSTS enforcement
- XSS protection
- Content type sniffing prevention
- Frame options security

### API Security
- CORS configured for web access
- Rate limiting via API Gateway
- Request validation

## 🌍 Multi-Region Deployment

For global users, consider deploying to multiple regions:

```bash
# Deploy to different regions
CDK_DEFAULT_REGION=us-west-2 cdk deploy
CDK_DEFAULT_REGION=eu-west-1 cdk deploy
```

## 📈 Scaling Considerations

### Current Limits
- Lambda: 1000 concurrent executions (soft limit)
- API Gateway: 10,000 requests/second (default)
- S3: Unlimited requests

### Upgrade Path
1. **Database**: Move from JSON to DynamoDB for better performance
2. **Caching**: Add ElastiCache for frequent data
3. **CDN**: Use multiple CloudFront distributions
4. **API**: Implement GraphQL for efficient data fetching

## 🛠️ Development vs Production

### Development
```bash
npm run dev
```

### Production Build Test
```bash
npm run build
npm start
```

### Static Export Test
```bash
npm run export
npx serve out
```

## 📝 Monitoring & Analytics

### CloudWatch Metrics
- Lambda duration and errors
- API Gateway request count
- CloudFront cache hit ratio

### Custom Metrics
Add to your Lambda functions:
```typescript
const AWS = require('aws-sdk');
const cloudwatch = new AWS.CloudWatch();

// Track train data updates
await cloudwatch.putMetricData({
  Namespace: 'SubwaySounds',
  MetricData: [{
    MetricName: 'TrainUpdates',
    Value: trainCount,
    Unit: 'Count'
  }]
}).promise();
```

## 🎉 Success!

After deployment, your real-time 3D NYC subway map will be available at:
- CloudFront URL (provided in CDK output)
- Custom domain (if configured)

Features available:
- ✅ Real-time train tracking
- ✅ 3D interactive map
- ✅ All 27 subway lines
- ✅ 472+ station database
- ✅ Mobile-optimized interface
- ✅ Auto-updating every 30 seconds
- ✅ Multiple map styles
- ✅ Station and train click popups

## 🆘 Support

For deployment issues:
1. Check AWS CloudFormation console
2. Review CloudWatch logs
3. Verify IAM permissions
4. Check CDK version compatibility

For application issues:
1. Browser console for client errors
2. Lambda logs for API errors
3. Network tab for failed requests

---

**Happy Mapping! 🗽🚇**