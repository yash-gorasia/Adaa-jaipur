import React, { useState } from 'react';
import { IoMail, IoLockClosed, IoEye, IoEyeOff } from 'react-icons/io5';
import { ImSpinner8 } from 'react-icons/im';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../Components/Shared/Header';

const colors = {
  primary: '#4E5D94', // Dark Slate Blue
  secondary: '#D9B44C', // Soft Gold
  accent: '#2C3E50', // Charcoal Gray
  background: '#F9F9F9', // Off-White
  text: '#1A2A44', // Midnight Blue
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Call the backend API for login
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store userId and isLogin in localStorage
      localStorage.setItem('userId', data.user._id);
      localStorage.setItem('isLogin', true);
      localStorage.setItem('isAdmin', data.user.hasOwnProperty('isAdmin') ? data.user.isAdmin : false); // Store admin status

      // Redirect based on user role
      if (data.user.isAdmin) {
        navigate('/admin'); // Redirect to admin dashboard
      } else {
        navigate('/'); // Redirect to home or user dashboard
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Header transparent={false} />
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: colors.background }}
      >
        {/* Decorative Pattern */}
        <div
          className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-red-800/5 to-transparent"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23eight81f41' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />

        <div className="max-w-md w-full transform transition-all duration-500 hover:scale-[1.02]">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-red-800/10">
            <div className="px-8 pt-8 pb-6">
              {/* Logo/Brand Section */}
              <div className="text-center mb-8 transform transition-all duration-500 hover:scale-105">
                <h1
                  className="font-serif text-4xl mb-2"
                  style={{ color: colors.primary }}
                >
                  Adaa Jaipur
                </h1>
                <div
                  className="h-1 w-16 mx-auto rounded"
                  style={{ backgroundColor: colors.secondary }}
                />
                <p className="mt-4 text-gray-600 font-sans">Welcome Back</p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="group">
                  <label
                    className="block text-sm font-medium mb-1"
                    style={{ color: colors.text }}
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <IoMail
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors duration-300"
                      style={{ color: colors.primary }}
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 w-full p-3 border-2 rounded-lg transition-all duration-300"
                      style={{
                        borderColor: 'rgba(139, 31, 65, 0.2)',
                        backgroundColor: 'rgba(253, 247, 243, 0.5)',
                      }}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="group">
                  <label
                    className="block text-sm font-medium mb-1"
                    style={{ color: colors.text }}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <IoLockClosed
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5"
                      style={{ color: colors.primary }}
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 w-full p-3 border-2 rounded-lg transition-all duration-300"
                      style={{
                        borderColor: 'rgba(139, 31, 65, 0.2)',
                        backgroundColor: 'rgba(253, 247, 243, 0.5)',
                      }}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <IoEyeOff
                          className="h-5 w-5"
                          style={{ color: colors.text }}
                        />
                      ) : (
                        <IoEye
                          className="h-5 w-5"
                          style={{ color: colors.text }}
                        />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-lg text-white font-medium transform hover:scale-[1.02] transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
                    boxShadow: `0 4px 14px rgba(139, 31, 65, 0.3)`,
                  }}
                >
                  {isLoading ? (
                    <ImSpinner8 className="animate-spin h-5 w-5 mx-auto" />
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>
              <p className="text-center mt-4">
                <Link
                  to="/signup"
                  className="text-primary hover:text-accent"
                  style={{ color: colors.primary }}
                >
                  Don't have an account?{' '}Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;