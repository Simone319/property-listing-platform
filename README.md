# Property Listing Platform

A full-stack property listing platform built with AWS Amplify Gen2, featuring passwordless authentication, image uploads, and relational data management.

## Features

- **Passwordless Authentication**: Native Cognito EMAIL_OTP - no passwords, just email codes!
- **Property Management**: Create, read, update, and delete property listings
- **Image Upload**: Upload multiple property images using Amplify Storage FileUploader
- **Relational Data**: Properties linked to users, images, and features
- **Public & Private Access**: Guest users can browse, authenticated users can list properties
- **Secure & Simple**: Built-in rate limiting, code expiration, and brute force protection

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: AWS Amplify Gen2
- **Authentication**: Amazon Cognito (passwordless email)
- **Database**: AWS AppSync + DynamoDB
- **Storage**: Amazon S3
- **UI Components**: Amplify UI React

## Data Model

### User
- Email, name, phone
- Has many properties

### Property
- Title, description, price, address
- Bedrooms, bathrooms, square feet
- Property type (house, apartment, condo, etc.)
- Status (available, pending, sold, rented)
- Belongs to user
- Has many images and features

### PropertyImage
- Image key (S3 reference)
- Caption, primary flag, order
- Belongs to property

### PropertyFeature
- Feature name and category
- Belongs to property

## Getting Started

### Prerequisites

- Node.js 18+ installed
- AWS account (SES sandbox mode works for development)
- Amplify CLI installed: `npm install -g @aws-amplify/cli`

### Quick Start

See [SETUP.md](./SETUP.md) for detailed setup instructions.

1. Install dependencies:
```bash
npm install
```

2. Deploy the Amplify backend:
```bash
npx ampx sandbox
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

**Note:** For development, verify your email in the [SES Console](https://console.aws.amazon.com/ses/) since AWS accounts start in sandbox mode. For production, request SES production access.

## Usage

### Passwordless Sign In
1. Enter your email address (no password needed!)
2. New users: Enter your name to create an account
3. Check your email for an 8-digit verification code
4. Enter the code to authenticate
5. You're in!

### Browse Properties
- View all available properties
- See property details, images, and pricing
- Filter by status and type

### List a Property
1. Click "List Property"
2. Fill in property details
3. Upload property images using the FileUploader
4. Submit to create the listing

### Manage Your Listings
- View your own properties
- Update property details
- Upload additional images
- Change property status

## Authorization Rules

- **Guest users**: Can read all properties
- **Authenticated users**: Can read all properties and create their own
- **Property owners**: Full CRUD access to their own properties

## Storage Configuration

- **Public bucket**: Property images accessible to all users
- **Protected paths**: User-specific uploads with read access for authenticated users

## Deployment

To deploy to production:

```bash
npx ampx pipeline-deploy --branch main --app-id <your-app-id>
```

## License

MIT
