import { NhostProvider } from '@nhost/react';
import { NhostApolloProvider } from '@nhost/react-apollo';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import nhost from './utils/nhost';

import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Preferences from './pages/Preferences';
import PrivateRoute from './components/PrivateRoute';

import './assets/styles/App.css';

function App() {
  return (
    <NhostProvider nhost={nhost}>
      <NhostApolloProvider nhost={nhost}>
        <Router>
          <Routes>
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/preferences" 
              element={
                <PrivateRoute>
                  <Preferences />
                </PrivateRoute>
              } 
            />
            <Route path="/" element={<SignIn />} />
          </Routes>
        </Router>
      </NhostApolloProvider>
    </NhostProvider>
  );
}

export default App;