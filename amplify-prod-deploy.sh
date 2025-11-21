#!/bin/bash

set -e

echo "🚀 AWS Amplify Production Deployment via CLI"
echo "============================================="
echo ""

# Configuration
APP_ID="d355dpbkbue1mo"
REGION="eu-central-1"
BRANCH_NAME="main"

echo "Configuration:"
echo "  App ID: $APP_ID"
echo "  Region: $REGION"
echo "  Branch: $BRANCH_NAME"
echo ""

# Check if we have a GitHub repo configured
echo "📋 Step 1: Checking GitHub repository..."
if git remote get-url origin &> /dev/null; then
    REPO_URL=$(git remote get-url origin)
    echo "✅ Git remote found: $REPO_URL"
else
    echo "❌ No git remote found!"
    echo ""
    echo "Please set up GitHub first:"
    echo "1. Create a repo at: https://github.com/new"
    echo "2. Run: git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git"
    echo "3. Run: git push -u origin main"
    echo ""
    exit 1
fi
echo ""

# Push latest changes
echo "📤 Step 2: Pushing latest changes to GitHub..."
read -p "Do you want to commit and push changes? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git add .
    git commit -m "Deploy to production" --no-verify || echo "No changes to commit"
    git push origin $BRANCH_NAME
    echo "✅ Changes pushed to GitHub"
else
    echo "⏭️  Skipping git push"
fi
echo ""

# Check if branch exists in Amplify
echo "🔍 Step 3: Checking if branch exists in Amplify..."
BRANCH_EXISTS=$(aws amplify get-branch \
    --app-id $APP_ID \
    --branch-name $BRANCH_NAME \
    --region $REGION 2>&1 || echo "not_found")

if [[ $BRANCH_EXISTS == *"not_found"* ]] || [[ $BRANCH_EXISTS == *"NotFoundException"* ]]; then
    echo "⚠️  Branch not connected to Amplify yet"
    echo ""
    echo "You need to connect your GitHub repository first."
    echo "This requires a GitHub personal access token."
    echo ""
    read -p "Do you have a GitHub personal access token? (y/n): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo "Please enter your GitHub personal access token:"
        echo "(Create one at: https://github.com/settings/tokens/new)"
        echo "Required scopes: repo, admin:repo_hook"
        echo ""
        read -s GITHUB_TOKEN
        
        # Extract owner and repo from git remote
        if [[ $REPO_URL =~ github\.com[:/]([^/]+)/([^/.]+) ]]; then
            GITHUB_OWNER="${BASH_REMATCH[1]}"
            GITHUB_REPO="${BASH_REMATCH[2]}"
            
            echo ""
            echo "Connecting repository: $GITHUB_OWNER/$GITHUB_REPO"
            
            # Update app with repository info
            aws amplify update-app \
                --app-id $APP_ID \
                --region $REGION \
                --repository "https://github.com/$GITHUB_OWNER/$GITHUB_REPO" \
                --access-token "$GITHUB_TOKEN" \
                --enable-branch-auto-build \
                --output json > /dev/null
            
            echo "✅ Repository connected"
            echo ""
            
            # Create branch
            echo "Creating branch in Amplify..."
            aws amplify create-branch \
                --app-id $APP_ID \
                --branch-name $BRANCH_NAME \
                --region $REGION \
                --enable-auto-build \
                --output json > /dev/null
            
            echo "✅ Branch created"
        else
            echo "❌ Could not parse GitHub repository URL"
            exit 1
        fi
    else
        echo ""
        echo "Please connect your repository manually:"
        echo "1. Go to: https://$REGION.console.aws.amazon.com/amplify/home?region=$REGION#/$APP_ID"
        echo "2. Click 'Host web app'"
        echo "3. Connect your GitHub repository"
        echo "4. Select branch: $BRANCH_NAME"
        echo "5. Then run this script again"
        exit 1
    fi
else
    echo "✅ Branch already connected to Amplify"
fi
echo ""

# Start deployment
echo "🚀 Step 4: Starting deployment..."
JOB_ID=$(aws amplify start-job \
    --app-id $APP_ID \
    --branch-name $BRANCH_NAME \
    --job-type RELEASE \
    --region $REGION \
    --query 'jobSummary.jobId' \
    --output text)

echo "✅ Deployment started"
echo "   Job ID: $JOB_ID"
echo ""

# Monitor deployment
echo "📊 Step 5: Monitoring deployment..."
echo "This may take 5-10 minutes..."
echo ""

while true; do
    JOB_STATUS=$(aws amplify get-job \
        --app-id $APP_ID \
        --branch-name $BRANCH_NAME \
        --job-id $JOB_ID \
        --region $REGION \
        --query 'job.summary.status' \
        --output text)
    
    case $JOB_STATUS in
        PENDING)
            echo "⏳ Status: Pending..."
            ;;
        PROVISIONING)
            echo "🔧 Status: Provisioning environment..."
            ;;
        RUNNING)
            echo "🏗️  Status: Building..."
            ;;
        SUCCEED)
            echo "✅ Status: Deployment successful!"
            break
            ;;
        FAILED|CANCELLED)
            echo "❌ Status: Deployment $JOB_STATUS"
            echo ""
            echo "View logs at:"
            echo "https://$REGION.console.aws.amazon.com/amplify/home?region=$REGION#/$APP_ID/$BRANCH_NAME/$JOB_ID"
            exit 1
            ;;
    esac
    
    sleep 10
done
echo ""

# Get deployment URL
echo "🌐 Step 6: Getting deployment URL..."
APP_URL=$(aws amplify get-branch \
    --app-id $APP_ID \
    --branch-name $BRANCH_NAME \
    --region $REGION \
    --query 'branch.defaultDomain' \
    --output text)

FULL_URL="https://$BRANCH_NAME.$APP_URL"

echo "✅ Deployment URL: $FULL_URL"
echo ""

# Save deployment info
cat > amplify-deployment-info.json << EOF
{
  "appId": "$APP_ID",
  "region": "$REGION",
  "branch": "$BRANCH_NAME",
  "jobId": "$JOB_ID",
  "url": "$FULL_URL",
  "deploymentDate": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "consoleUrl": "https://$REGION.console.aws.amazon.com/amplify/home?region=$REGION#/$APP_ID"
}
EOF

echo "💾 Deployment info saved to: amplify-deployment-info.json"
echo ""

# Summary
echo "🎉 Deployment Complete!"
echo "======================"
echo ""
echo "Your application is live at:"
echo "  $FULL_URL"
echo ""
echo "Amplify Console:"
echo "  https://$REGION.console.aws.amazon.com/amplify/home?region=$REGION#/$APP_ID"
echo ""
echo "⚠️  Important Next Steps:"
echo ""
echo "1. Verify your email in SES for authentication:"
echo "   https://$REGION.console.aws.amazon.com/ses/"
echo ""
echo "2. Test your application:"
echo "   - Create an account"
echo "   - List a property"
echo "   - Upload images"
echo ""
echo "3. To deploy updates:"
echo "   - Make changes to your code"
echo "   - Run: git add . && git commit -m 'Update' && git push"
echo "   - Or run this script again"
echo ""
echo "4. View deployment logs:"
echo "   aws amplify get-job --app-id $APP_ID --branch-name $BRANCH_NAME --job-id $JOB_ID --region $REGION"
echo ""
