import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    // Check authentication status
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // In demo mode or development, allow access
      if (process.env.NODE_ENV === 'development' || process.env.REACT_APP_DEMO_MODE === 'true') {
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }

      // Check for valid session/token
      const token = localStorage.getItem('salesherpa_token');
      if (token) {
        // Verify token with backend
        const response = await fetch('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('salesherpa_token');
          setShowLoginModal(true);
        }
      } else {
        setShowLoginModal(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setShowLoginModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (credentials) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      if (response.ok) {
        const { token } = await response.json();
        localStorage.setItem('salesherpa_token', token);
        setIsAuthenticated(true);
        setShowLoginModal(false);
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please check your credentials.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          <p className="mt-4 text-slate-600">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-slate-50">
        {showLoginModal && <LoginModal onLogin={handleLogin} />}
        <Navigate to="/" replace />
      </div>
    );
  }

  return children;
};

const LoginModal = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    await onLogin({ email, password });
    
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="h-12 w-12 rounded-2xl overflow-hidden">
              <div className="h-full w-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">🧭</span>
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome to TheSalesSherpa</h2>
          <p className="text-gray-600 mt-2">Sign in to access Matt's territory dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              placeholder="matt@firstadvantage.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              placeholder="Enter your password"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center">
              <input type="checkbox" className="rounded text-orange-600" />
              <span className="ml-2 text-gray-700">Remember me</span>
            </label>
            <a href="#" className="text-orange-600 hover:text-orange-700">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-orange-700 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Signing in...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Demo mode: Use any email/password to continue
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProtectedRoute;