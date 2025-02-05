import React, { useState, useEffect } from 'react';
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

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save userId, JWT token, and isLogin to localStorage
        localStorage.setItem('userId', data.user._id); // Store userId
        localStorage.setItem('token', data.token); // Store JWT token
        localStorage.setItem('isLogin', 'true'); // Set isLogin to true

        console.log('User ID:', data.user._id);
        console.log('JWT Token:', data.token);

        setIsLoading(false);
        setShowModal(true); // Show success modal
      } else {
        setIsLoading(false);
        alert(data.message || 'Registration failed');
      }
    } catch (err) {
      setIsLoading(false);
      console.error('Error during sign-up:', err);
      alert('Something went wrong. Please try again.');
    }
  };

  const handleCompleteProfile = () => {
    setShowModal(false);
    navigate('/complete-profile');
  };

  const handleGoHome = () => {
    setShowModal(false);
    navigate('/home');
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      <Header transparent={false} />
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: colors.background }}
      >
        <div className="max-w-md w-full transform transition-all duration-500 hover:scale-[1.02]">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-red-800/10">
            <div className="px-8 pt-8 pb-6">
              <div className="text-center mb-8 transform transition-all duration-500 hover:scale-105">
                <h1 className="font-serif text-4xl mb-2" style={{ color: colors.primary }}>
                  Adaa Jaipur
                </h1>
                <div
                  className="h-1 w-16 mx-auto rounded"
                  style={{ backgroundColor: colors.secondary }}
                />
                <p className="mt-4 text-gray-600 font-sans">Create Account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div className="group">
                  <label
                    className="block text-sm font-medium mb-1"
                    style={{ color: colors.text }}
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 border-2 rounded-lg transition-all duration-300"
                    style={{
                      borderColor: 'rgba(139, 31, 65, 0.2)',
                      backgroundColor: 'rgba(253, 247, 243, 0.5)',
                    }}
                    placeholder="Your Name"
                    required
                  />
                </div>

                {/* Email Address */}
                <div className="group">
                  <label
                    className="block text-sm font-medium mb-1"
                    style={{ color: colors.text }}
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <IoMail
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5"
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

                {/* Password */}
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
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
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
                    'Create Account'
                  )}
                </button>
              </form>
              <p className="text-center mt-4">
                <Link to="/login" className="text-primary hover:text-accent">
                  Already Have Account?{' '}Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg text-center">
            <h2 className="text-xl font-bold mb-4" style={{ color: colors.primary }}>
              Profile Setup
            </h2>
            <p className="text-gray-700 mb-6">Do you want to complete your profile now?</p>
            <div className="flex space-x-4 justify-center">
              <button
                onClick={handleCompleteProfile}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Complete Profile
              </button>
              <button
                onClick={handleGoHome}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignUp;