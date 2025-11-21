#!/bin/bash

echo "🚀 Property Listing Platform - Deployment Script"
echo "================================================"
echo ""

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI is not configured. Please run: aws configure"
    exit 1
fi

echo "✅ AWS credentials verified"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

echo "Choose deployment option:"
echo "1) Sandbox (Development - temporary)"
echo "2) Production (Permanent deployment with CI/CD)"
echo ""
read -p "Enter choice (1 or 2): " choice

case $choice in
    1)
        echo ""
        echo "🏖️  Starting Amplify Sandbox..."
        echo "This will deploy backend resources to AWS"
        echo "Keep this terminal open - closing it will delete the sandbox"
        echo ""
        npx ampx sandbox
        ;;
    2)
        echo ""
        echo "🏭 Production Deployment"
        echo ""
        
        # Check if git is initialized
        if [ ! -d ".git" ]; then
            echo "📝 Initializing git repository..."
            git init
            git add .
            git commit -m "Initial commit - Property Listing Platform"
            echo ""
        fi
        
        echo "Next steps for production deployment:"
        echo ""
        echo "1. Create a GitHub repository at: https://github.com/new"
        echo "2. Run these commands to push your code:"
        echo ""
        echo "   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git"
        echo "   git branch -M main"
        echo "   git push -u origin main"
        echo ""
        echo "3. Then run: npx ampx pipeline-deploy --branch main"
        echo ""
        echo "Or, if you want to deploy without GitHub:"
        echo "   npx ampx sandbox --outputs-out-dir ./amplify_outputs"
        echo ""
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac
