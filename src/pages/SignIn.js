import { useState } from 'react';
import { useSignInEmailPassword } from '@nhost/react';
import { Navigate, Link } from 'react-router-dom';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const { signInEmailPassword, isLoading, isSuccess, isError, error } = useSignInEmailPassword();

  if (isSuccess) {
    return <Navigate to="/dashboard" replace={true} />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    await signInEmailPassword(email, password);
  };

  return (
    <div className="auth-container">
      <h1>Sign In</h1>
      {isError && <div className="error">{error?.message}</div>}
      <form onSubmit={handleSubmit}>
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
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      <p>
        Don't have an account? <Link to="/sign-up">Sign up</Link>
      </p>
    </div>
  );
};

export default SignIn;