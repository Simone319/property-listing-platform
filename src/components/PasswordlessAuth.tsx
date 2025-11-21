import { useState } from 'react';
import { signIn, signUp, confirmSignIn, autoSignIn } from 'aws-amplify/auth';
import './PasswordlessAuth.css';

interface PasswordlessAuthProps {
  onSuccess: () => void;
}

export default function PasswordlessAuth({ onSuccess }: PasswordlessAuthProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code' | 'signup'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Try to sign in with EMAIL_OTP
      const result = await signIn({
        username: email,
        options: {
          authFlowType: 'USER_AUTH',
          preferredChallenge: 'EMAIL_OTP',
        },
      });

      if (result.nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_EMAIL_CODE') {
        setStep('code');
      }
    } catch (err: any) {
      // If user doesn't exist, prompt for signup
      if (err.name === 'UserNotFoundException') {
        setStep('signup');
      } else {
        setError(err.message || 'Failed to send code');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { isSignUpComplete, nextStep } = await signUp({
        username: email,
        password: password,
        options: {
          userAttributes: {
            email,
            name,
          },
        },
      });

      console.log('SignUp result:', { isSignUpComplete, nextStep });

      // After signup, initiate sign in with EMAIL_OTP
      if (isSignUpComplete || nextStep.signUpStep === 'DONE') {
        const signInResult = await signIn({
          username: email,
          options: {
            authFlowType: 'USER_AUTH',
            preferredChallenge: 'EMAIL_OTP',
          },
        });

        if (signInResult.nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_EMAIL_CODE') {
          setStep('code');
        }
      } else if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        // If email confirmation is required, show code input
        setStep('code');
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Try to confirm sign in (for EMAIL_OTP)
      const result = await confirmSignIn({
        challengeResponse: code,
      });

      if (result.isSignedIn) {
        onSuccess();
      } else {
        console.log('Sign in not complete, next step:', result.nextStep);
        setError('Sign in not complete. Please try again.');
      }
    } catch (err: any) {
      console.error('Code confirmation error:', err);
      setError(err.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('email');
    setCode('');
    setPassword('');
    setError('');
  };

  return (
    <div className="passwordless-auth">
      <div className="auth-container">
        <h1>Property Listings</h1>
        <p className="subtitle">Passwordless Authentication</p>

        {step === 'email' && (
          <form onSubmit={handleEmailSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
              />
            </div>

            {error && <div className="error">{error}</div>}

            <button type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Continue with Email'}
            </button>

            <button 
              type="button" 
              onClick={() => setStep('signup')} 
              className="secondary"
              style={{ marginTop: '0.5rem' }}
            >
              Create New Account
            </button>

            <p className="info">
              We'll send you a one-time code to sign in. No password needed!
            </p>
          </form>
        )}

        {step === 'signup' && (
          <form onSubmit={handleSignUp}>
            <h2>Create Account</h2>
            <p className="info-text">Create your account to start listing properties.</p>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled
              />
            </div>

            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                required
                minLength={8}
              />
              <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
                Must contain uppercase, lowercase, number, and special character
              </small>
            </div>

            {error && <div className="error">{error}</div>}

            <button type="submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            <button type="button" onClick={handleBack} className="secondary">
              Back
            </button>
          </form>
        )}

        {step === 'code' && (
          <form onSubmit={handleCodeSubmit}>
            <h2>Check Your Email</h2>
            <p className="info-text">
              We sent an 8-digit code to <strong>{email}</strong>
            </p>

            <div className="form-group">
              <label>Verification Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                placeholder="12345678"
                required
                autoFocus
                maxLength={8}
                className="code-input"
              />
            </div>

            {error && <div className="error">{error}</div>}

            <button type="submit" disabled={loading || code.length !== 8}>
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>

            <button type="button" onClick={handleBack} className="secondary">
              Use Different Email
            </button>

            <p className="info">
              Didn't receive the code? Check your spam folder or try again.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
