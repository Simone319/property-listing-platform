import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';

const backend = defineBackend({
  auth,
  data,
  storage,
});

// Enable passwordless authentication with EMAIL_OTP
const { cfnUserPool, cfnUserPoolClient } = backend.auth.resources.cfnResources;

// Enable EMAIL_OTP as an allowed authentication factor
// Note: PASSWORD must be included even if we only use EMAIL_OTP
cfnUserPool.addPropertyOverride('Policies.SignInPolicy.AllowedFirstAuthFactors', [
  'PASSWORD',
  'EMAIL_OTP',
]);

// Enable USER_AUTH flow for passwordless authentication
cfnUserPoolClient.explicitAuthFlows = [
  'ALLOW_REFRESH_TOKEN_AUTH',
  'ALLOW_USER_AUTH',
];
