# Deployment Guide - Property Listing Platform

This guide will help you deploy the property listing platform to your AWS account.

## Prerequisites

Before deploying, ensure you have:

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured
3. **Node.js 18+** installed
4. **Git** installed (for version control)

## Step 1: Configure AWS Credentials

If you haven't already configured AWS CLI, run:

```bash
aws configure
```

Enter your:
- AWS Access Key ID
- AWS Secret Access Key
- Default region (e.g., `us-east-1`, `eu-central-1`)
- Default output format (use `json`)

To verify your credentials:

```bash
aws sts get-caller-identity
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Build the Frontend

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

## Step 4: Deploy Backend to AWS

### Option A: Sandbox Environment (Development/Testing)

For quick testing and development:

```bash
npx ampx sandbox
```

This creates a temporary cloud sandbox that:
- Deploys all backend resources (Auth, Data, Storage)
- Generates `amplify_outputs.json` for frontend
- Stays active as long as the process runs
- Automatically tears down when you stop it

**Note:** Keep this terminal open while developing. The sandbox will be deleted when you close it.

### Option B: Production Deployment

For a permanent production deployment:

1. **Initialize Git repository** (if not already done):

```bash
git init
git add .
git commit -m "Initial commit"
```

2. **Create a GitHub repository** and push your code:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

3. **Deploy using Amplify Hosting**:

```bash
# First, create an Amplify app
npx ampx pipeline-deploy --branch main
```

Follow the prompts to:
- Connect to your GitHub repository
- Select the branch to deploy (main)
- Configure build settings

The command will:
- Create an Amplify app in your AWS account
- Set up CI/CD pipeline
- Deploy backend resources
- Build and host the frontend
- Provide a live URL

## Step 5: Configure Amazon SES (Email Service)

For passwordless authentication to work, configure SES:

### Development (Sandbox Mode)

1. Go to [AWS SES Console](https://console.aws.amazon.com/ses/)
2. Select your deployment region
3. Click **Verified identities** → **Create identity**
4. Choose **Email address**
5. Enter your email address
6. Click **Create identity**
7. Check your email and verify

**Note:** In sandbox mode, you can only send emails to verified addresses.

### Production

To send emails to any address:

1. Go to [AWS SES Console](https://console.aws.amazon.com/ses/)
2. Click **Account dashboard**
3. Click **Request production access**
4. Fill out the form:
   - Use case: Transactional emails for authentication
   - Website URL: Your app URL
   - Describe how you handle bounces/complaints
5. Submit and wait for approval (usually 24-48 hours)

## Step 6: Access Your Application

### Sandbox Deployment

After running `npx ampx sandbox`:
1. Wait for deployment to complete
2. Run `npm run dev` in a new terminal
3. Open `http://localhost:5173`

### Production Deployment

After `npx ampx pipeline-deploy`:
1. The command will output your app URL
2. Or find it in [Amplify Console](https://console.aws.amazon.com/amplify/)
3. Click on your app → View deployed URL

## Step 7: Test the Application

1. **Create an account**:
   - Click "Create New Account"
   - Enter email, name, and password
   - Check email for 8-digit code
   - Enter code to verify

2. **List a property**:
   - Click "List Property"
   - Fill in property details
   - Upload images
   - Submit

3. **Browse properties**:
   - Click "Browse Properties"
   - View all listings with images

## Monitoring and Logs

### View CloudWatch Logs

```bash
# View all log groups
aws logs describe-log-groups

# View specific logs (replace with your log group name)
aws logs tail /aws/amplify/YOUR_APP_ID --follow
```

### View Amplify Console

1. Go to [Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click on your app
3. View:
   - Build history
   - Backend resources
   - Monitoring metrics
   - Logs

## Updating Your Deployment

### Sandbox

Just save your files - the sandbox auto-updates.

### Production

Push changes to GitHub:

```bash
git add .
git commit -m "Your changes"
git push
```

Amplify automatically rebuilds and deploys.

## Cost Estimates

Typical monthly costs for low-traffic app:

- **Cognito**: Free tier (50,000 MAUs)
- **AppSync/DynamoDB**: ~$1-5
- **S3 Storage**: ~$0.50-2
- **SES**: $0.10 per 1,000 emails
- **Amplify Hosting**: ~$0.15 per GB served

**Total**: ~$2-10/month for small-scale usage

## Troubleshooting

### Deployment Fails

```bash
# Check AWS credentials
aws sts get-caller-identity

# Check Amplify CLI version
npx ampx --version

# View detailed logs
npx ampx sandbox --debug
```

### Email Not Sending

- Verify email in SES Console
- Check CloudWatch logs for errors
- Ensure you're in the correct AWS region
- Request production access for unrestricted sending

### Images Not Loading

- Check S3 bucket permissions
- Verify storage configuration in `amplify/storage/resource.ts`
- Check browser console for CORS errors

### Authentication Issues

- Clear browser cache and cookies
- Check Cognito User Pool settings
- Verify EMAIL_OTP is enabled in backend.ts
- Check CloudWatch logs for auth errors

## Cleanup (Delete Resources)

To delete all AWS resources:

### Sandbox

Just stop the sandbox process (Ctrl+C).

### Production

```bash
# Delete the Amplify app
npx ampx delete

# Or use AWS Console:
# 1. Go to Amplify Console
# 2. Select your app
# 3. Actions → Delete app
```

**Warning:** This permanently deletes all data!

## Security Best Practices

1. **Enable MFA** on your AWS account
2. **Use IAM roles** with least privilege
3. **Enable CloudTrail** for audit logging
4. **Rotate credentials** regularly
5. **Monitor costs** with AWS Budgets
6. **Enable AWS WAF** for production apps
7. **Use HTTPS only** (Amplify does this by default)

## Next Steps

- Set up custom domain
- Configure CI/CD pipeline
- Add monitoring and alerts
- Implement backup strategy
- Set up staging environment
- Add more features!

## Support

- [Amplify Documentation](https://docs.amplify.aws/)
- [AWS Support](https://console.aws.amazon.com/support/)
- [Amplify Discord](https://discord.gg/amplify)

## Summary

You now have a fully deployed property listing platform with:
- ✅ Passwordless authentication (EMAIL_OTP)
- ✅ User-set passwords during signup
- ✅ Property listings with images
- ✅ Relational data (properties, images, features)
- ✅ Secure storage with S3
- ✅ Scalable backend with AppSync + DynamoDB
- ✅ Production-ready hosting

Happy deploying! 🚀
