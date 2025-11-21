#!/bin/bash

set -e

echo "🚀 AWS CLI Deployment Script"
echo "============================"
echo ""

# Configuration
APP_NAME="property-listing-platform"
REGION="eu-central-1"
AMPLIFY_APP_ID="d355dpbkbue1mo"

echo "Configuration:"
echo "  App Name: $APP_NAME"
echo "  Region: $REGION"
echo "  Amplify App ID: $AMPLIFY_APP_ID"
echo ""

# Step 1: Build the frontend
echo "📦 Step 1: Building frontend..."
npm run build
echo "✅ Frontend built successfully"
echo ""

# Step 2: Create S3 bucket for frontend hosting
BUCKET_NAME="${APP_NAME}-frontend-$(date +%s)"
echo "🪣 Step 2: Creating S3 bucket: $BUCKET_NAME"

aws s3 mb s3://$BUCKET_NAME --region $REGION

# Configure bucket for static website hosting
aws s3 website s3://$BUCKET_NAME \
  --index-document index.html \
  --error-document index.html

echo "✅ S3 bucket created"
echo ""

# Step 3: Create bucket policy for public read access
echo "🔓 Step 3: Setting bucket policy..."

cat > /tmp/bucket-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy \
  --bucket $BUCKET_NAME \
  --policy file:///tmp/bucket-policy.json

echo "✅ Bucket policy set"
echo ""

# Step 4: Upload frontend files
echo "📤 Step 4: Uploading frontend files..."

aws s3 sync dist/ s3://$BUCKET_NAME/ \
  --delete \
  --cache-control "public, max-age=31536000" \
  --exclude "index.html"

# Upload index.html with no-cache
aws s3 cp dist/index.html s3://$BUCKET_NAME/index.html \
  --cache-control "no-cache"

echo "✅ Frontend uploaded"
echo ""

# Step 5: Create CloudFront distribution
echo "☁️  Step 5: Creating CloudFront distribution..."

DISTRIBUTION_CONFIG=$(cat << EOF
{
  "CallerReference": "$(date +%s)",
  "Comment": "$APP_NAME",
  "Enabled": true,
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-$BUCKET_NAME",
        "DomainName": "$BUCKET_NAME.s3-website.$REGION.amazonaws.com",
        "CustomOriginConfig": {
          "HTTPPort": 80,
          "HTTPSPort": 443,
          "OriginProtocolPolicy": "http-only"
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-$BUCKET_NAME",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"],
      "CachedMethods": {
        "Quantity": 2,
        "Items": ["GET", "HEAD"]
      }
    },
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {
        "Forward": "none"
      }
    },
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000,
    "Compress": true
  },
  "CustomErrorResponses": {
    "Quantity": 1,
    "Items": [
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      }
    ]
  }
}
EOF
)

echo "$DISTRIBUTION_CONFIG" > /tmp/cloudfront-config.json

DISTRIBUTION_ID=$(aws cloudfront create-distribution \
  --distribution-config file:///tmp/cloudfront-config.json \
  --region $REGION \
  --query 'Distribution.Id' \
  --output text)

CLOUDFRONT_DOMAIN=$(aws cloudfront get-distribution \
  --id $DISTRIBUTION_ID \
  --query 'Distribution.DomainName' \
  --output text)

echo "✅ CloudFront distribution created"
echo "   Distribution ID: $DISTRIBUTION_ID"
echo ""

# Step 6: Save deployment info
echo "💾 Step 6: Saving deployment info..."

cat > deployment-info.json << EOF
{
  "appName": "$APP_NAME",
  "region": "$REGION",
  "amplifyAppId": "$AMPLIFY_APP_ID",
  "s3Bucket": "$BUCKET_NAME",
  "s3WebsiteUrl": "http://$BUCKET_NAME.s3-website.$REGION.amazonaws.com",
  "cloudFrontDistributionId": "$DISTRIBUTION_ID",
  "cloudFrontUrl": "https://$CLOUDFRONT_DOMAIN",
  "deploymentDate": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF

echo "✅ Deployment info saved to deployment-info.json"
echo ""

# Summary
echo "🎉 Deployment Complete!"
echo "======================"
echo ""
echo "Your application is deployed at:"
echo ""
echo "  S3 Website: http://$BUCKET_NAME.s3-website.$REGION.amazonaws.com"
echo "  CloudFront: https://$CLOUDFRONT_DOMAIN (will be ready in ~15 minutes)"
echo ""
echo "Backend Resources:"
echo "  - Cognito User Pool (from sandbox)"
echo "  - AppSync GraphQL API (from sandbox)"
echo "  - DynamoDB Tables (from sandbox)"
echo "  - S3 Storage Bucket (from sandbox)"
echo ""
echo "⚠️  Important Next Steps:"
echo ""
echo "1. Update amplify_outputs.json with production backend URLs"
echo "2. Verify your email in SES:"
echo "   https://$REGION.console.aws.amazon.com/ses/"
echo ""
echo "3. Test your application:"
echo "   - Wait 15 minutes for CloudFront to deploy"
echo "   - Visit: https://$CLOUDFRONT_DOMAIN"
echo ""
echo "4. To update the frontend:"
echo "   npm run build"
echo "   aws s3 sync dist/ s3://$BUCKET_NAME/ --delete"
echo "   aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths '/*'"
echo ""

# Cleanup temp files
rm -f /tmp/bucket-policy.json /tmp/cloudfront-config.json

echo "Deployment info saved to: deployment-info.json"
echo ""
