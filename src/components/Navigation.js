import { useSignOut } from '@nhost/react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const { signOut } = useSignOut();
  const location = useLocation();

  return (
    <nav className="main-navigation">
      <div className="nav-brand">
        <h2>NewsSage</h2>
      </div>
      <div className="nav-links">
        <Link 
          to="/dashboard" 
          className={location.pathname === '/dashboard' ? 'active' : ''}
        >
          Dashboard
        </Link>
        <Link 
          to="/preferences" 
          className={location.pathname === '/preferences' ? 'active' : ''}
        >
          Preferences
        </Link>
        <button onClick={signOut} className="sign-out-btn">
          Sign Out
        </button>
      </div>
    </nav>
  );
};

export default Navigation;