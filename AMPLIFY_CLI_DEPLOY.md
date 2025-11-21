# AWS Amplify Production Deployment - CLI Guide

## Your Setup

- **App ID:** `d355dpbkbue1mo`
- **Region:** `eu-central-1`
- **GitHub Repo:** `https://github.com/Simone319/property-listing-platform.git`
- **Branch:** `main`

## Step 1: Push Your Code to GitHub

```bash
# Add all files
git add .

# Commit changes
git commit -m "Ready for production deployment" --no-verify

# Push to GitHub
git push origin main
```

## Step 2: Create GitHub Personal Access Token

You need a GitHub token to connect Amplify to your repository.

1. Go to: https://github.com/settings/tokens/new
2. Token name: `amplify-deployment`
3. Expiration: `90 days` (or your preference)
4. Select scopes:
   - ✅ `repo` (all repo permissions)
   - ✅ `admin:repo_hook` (webhook permissions)
5. Click "Generate token"
6. **Copy the token** (you won't see it again!)

## Step 3: Connect Repository to Amplify

```bash
# Set your GitHub token (replace with your actual token)
export GITHUB_TOKEN="ghp_your_token_here"

# Update Amplify app with repository
aws amplify update-app \
  --app-id d355dpbkbue1mo \
  --region eu-central-1 \
  --repository "https://github.com/Simone319/property-listing-platform" \
  --access-token "$GITHUB_TOKEN" \
  --enable-branch-auto-build
```

## Step 4: Create Branch in Amplify

```bash
# Create the main branch
aws amplify create-branch \
  --app-id d355dpbkbue1mo \
  --branch-name main \
  --region eu-central-1 \
  --enable-auto-build \
  --framework "React"
```

## Step 5: Start Deployment

```bash
# Trigger a deployment
aws amplify start-job \
  --app-id d355dpbkbue1mo \
  --branch-name main \
  --job-type RELEASE \
  --region eu-central-1
```

This will return a Job ID. Save it!

## Step 6: Monitor Deployment

```bash
# Check deployment status (replace JOB_ID with actual ID from step 5)
aws amplify get-job \
  --app-id d355dpbkbue1mo \
  --branch-name main \
  --job-id YOUR_JOB_ID \
  --region eu-central-1
```

Or use the automated script:

```bash
./amplify-prod-deploy.sh
```

## Step 7: Get Your Live URL

```bash
# Get the deployment URL
aws amplify get-branch \
  --app-id d355dpbkbue1mo \
  --branch-name main \
  --region eu-central-1 \
  --query 'branch.defaultDomain' \
  --output text
```

Your app will be at: `https://main.d355dpbkbue1mo.amplifyapp.com`

## Alternative: Use the Automated Script

I've created a script that does all of this for you:

```bash
./amplify-prod-deploy.sh
```

The script will:
1. ✅ Check your GitHub setup
2. ✅ Push latest changes
3. ✅ Connect repository (if needed)
4. ✅ Create branch (if needed)
5. ✅ Start deployment
6. ✅ Monitor progress
7. ✅ Show your live URL

## Troubleshooting

### Error: "Repository not found"

Make sure your GitHub token has the correct permissions and the repository URL is correct.

### Error: "Branch already exists"

That's okay! Just skip step 4 and go directly to step 5.

### Deployment Failed

Check the logs:

```bash
# View build logs
aws amplify list-jobs \
  --app-id d355dpbkbue1mo \
  --branch-name main \
  --region eu-central-1 \
  --max-results 5
```

Or visit the console:
https://eu-central-1.console.aws.amazon.com/amplify/home?region=eu-central-1#/d355dpbkbue1mo

### Authentication Not Working

Verify your email in SES:

```bash
# List verified identities
aws ses list-identities --region eu-central-1

# If your email is not listed, verify it:
aws ses verify-email-identity \
  --email-address your-email@example.com \
  --region eu-central-1
```

Then check your email and click the verification link.

## Post-Deployment

### 1. Test Your Application

Visit: `https://main.d355dpbkbue1mo.amplifyapp.com`

- Create an account
- List a property
- Upload images
- Browse properties

### 2. Set Up Custom Domain (Optional)

```bash
# Add custom domain
aws amplify create-domain-association \
  --app-id d355dpbkbue1mo \
  --domain-name yourdomain.com \
  --region eu-central-1 \
  --sub-domain-settings prefix=www,branchName=main
```

### 3. Enable Monitoring

```bash
# Enable CloudWatch alarms
aws cloudwatch put-metric-alarm \
  --alarm-name amplify-app-errors \
  --alarm-description "Alert on Amplify app errors" \
  --metric-name 4xxError \
  --namespace AWS/AmplifyHosting \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --region eu-central-1
```

## Continuous Deployment

Once set up, every push to `main` will automatically trigger a deployment:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Amplify automatically deploys!
```

## Useful Commands

### View all deployments
```bash
aws amplify list-jobs \
  --app-id d355dpbkbue1mo \
  --branch-name main \
  --region eu-central-1
```

### Stop a deployment
```bash
aws amplify stop-job \
  --app-id d355dpbkbue1mo \
  --branch-name main \
  --job-id YOUR_JOB_ID \
  --region eu-central-1
```

### Delete branch (careful!)
```bash
aws amplify delete-branch \
  --app-id d355dpbkbue1mo \
  --branch-name main \
  --region eu-central-1
```

### View app details
```bash
aws amplify get-app \
  --app-id d355dpbkbue1mo \
  --region eu-central-1
```

## Summary

Your deployment workflow:

1. **Develop locally** with `npx ampx sandbox`
2. **Commit changes** to git
3. **Push to GitHub** 
4. **Deploy automatically** or trigger manually with `aws amplify start-job`
5. **Monitor** via CLI or console
6. **Access** at `https://main.d355dpbkbue1mo.amplifyapp.com`

## Support

- **Console:** https://eu-central-1.console.aws.amazon.com/amplify/home?region=eu-central-1#/d355dpbkbue1mo
- **Docs:** https://docs.amplify.aws/
- **CLI Reference:** https://docs.aws.amazon.com/cli/latest/reference/amplify/

---

**Ready to deploy? Run:** `./amplify-prod-deploy.sh`
