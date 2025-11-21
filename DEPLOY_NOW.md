# Quick Deployment Guide

Your Amplify app is ready! Follow these steps to deploy:

## Your App Details

- **App ID:** `d355dpbkbue1mo`
- **Region:** `eu-central-1`
- **Console URL:** https://eu-central-1.console.aws.amazon.com/amplify/home?region=eu-central-1#/d355dpbkbue1mo

## Step 1: Create GitHub Repository

1. Go to: https://github.com/new
2. Repository name: `property-listing-platform`
3. Choose Public or Private
4. **Don't** check "Initialize with README"
5. Click "Create repository"

## Step 2: Push Code to GitHub

After creating the repo, run these commands (replace YOUR_USERNAME with your GitHub username):

```bash
git remote add origin https://github.com/YOUR_USERNAME/property-listing-platform.git
git push -u origin main
```

## Step 3: Connect GitHub to Amplify

### Option A: Using AWS Console (Easiest)

1. Open: https://eu-central-1.console.aws.amazon.com/amplify/home?region=eu-central-1#/d355dpbkbue1mo

2. Click **"Host web app"** or **"Connect repository"**

3. Choose **GitHub** as the source

4. Click **"Connect GitHub"** and authorize AWS Amplify

5. Select your repository: `property-listing-platform`

6. Select branch: `main`

7. Review the build settings (amplify.yml will be auto-detected)

8. Click **"Save and deploy"**

### Option B: Using AWS CLI

```bash
# First, create a GitHub personal access token at:
# https://github.com/settings/tokens/new
# Select scopes: repo (all), admin:repo_hook

# Then run:
aws amplify create-branch \
  --app-id d355dpbkbue1mo \
  --branch-name main \
  --region eu-central-1

aws amplify start-job \
  --app-id d355dpbkbue1mo \
  --branch-name main \
  --job-type RELEASE \
  --region eu-central-1
```

## Step 4: Wait for Deployment

The deployment process takes about 5-10 minutes:

1. **Provision** - Setting up build environment
2. **Build** - Installing dependencies and building
3. **Deploy** - Deploying to Amplify hosting
4. **Verify** - Running tests

## Step 5: Access Your App

Once deployed, your app will be available at:

**https://main.d355dpbkbue1mo.amplifyapp.com**

## Step 6: Configure SES for Emails

For authentication to work, verify your email in SES:

1. Go to: https://eu-central-1.console.aws.amazon.com/ses/
2. Click "Verified identities" → "Create identity"
3. Choose "Email address"
4. Enter your email and verify it

## Troubleshooting

### Build Fails

Check the build logs in Amplify Console:
https://eu-central-1.console.aws.amazon.com/amplify/home?region=eu-central-1#/d355dpbkbue1mo

### Can't Connect GitHub

Make sure you:
- Have admin access to the repository
- Authorized AWS Amplify in GitHub settings
- Selected the correct repository and branch

### Emails Not Sending

- Verify your email in SES Console
- Check you're in the correct region (eu-central-1)
- Request production access for unrestricted sending

## Alternative: Deploy Without GitHub

If you don't want to use GitHub, you can deploy using the sandbox:

```bash
# Keep your sandbox running
npx ampx sandbox

# In another terminal, build and serve
npm run build
npm run preview
```

Then manually upload the `dist/` folder to S3 or use Amplify Hosting's manual deployment.

## Next Steps

After deployment:

1. ✅ Test authentication (create account, sign in)
2. ✅ Test property creation with images
3. ✅ Set up custom domain (optional)
4. ✅ Configure monitoring and alerts
5. ✅ Request SES production access

## Support

- Amplify Console: https://eu-central-1.console.aws.amazon.com/amplify/
- Documentation: https://docs.amplify.aws/
- Your app: https://main.d355dpbkbue1mo.amplifyapp.com (after deployment)

---

**Current Status:** Ready to push to GitHub and deploy! 🚀
