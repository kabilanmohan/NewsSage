import { useState } from 'react';
import { useSignUpEmailPassword } from '@nhost/react';
import { Link } from 'react-router-dom';

const SignUp = () => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { signUpEmailPassword, isLoading, isSuccess, isError, error, needsEmailVerification } = 
    useSignUpEmailPassword();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await signUpEmailPassword(email, password, {
      displayName,
      metadata: {
        displayName
      }
    });
  };

  if (isSuccess || needsEmailVerification) {
    return (
      <div className="auth-container">
        <h1>Sign Up Successful</h1>
        <p>
          {needsEmailVerification
            ? 'Please check your email to verify your account.'
            : 'Your account has been created. You can now sign in.'}
        </p>
        <Link to="/sign-in" className="btn">
          Go to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <h1>Sign Up</h1>
      {isError && <div className="error">{error?.message}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="displayName">Name</label>
          <input
            type="text"
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
      <p>
        Already have an account? <Link to="/sign-in">Sign in</Link>
      </p>
    </div>
  );
};

export default SignUp;
