// ============================================
// EntreSkillHub - Login Page
// ============================================

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { ButtonLoader } from '../components/common/Loader';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const from = location.state?.from || '/dashboard';

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(formData);
    setLoading(false);
    if (result?.success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <>
      <Helmet>
        <title>Login - EntreSkillHub</title>
      </Helmet>

      <div className="min-h-screen flex bg-dark-50 dark:bg-dark-900">
        {/* Left: Illustration/Branding */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary-600 via-secondary-600 to-primary-800 items-center justify-center p-12">
          <div className="absolute inset-0 bg-grid opacity-20"></div>
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>

          <div className="relative z-10 text-center text-white max-w-md">
            <Link to="/" className="text-4xl font-bold text-white block mb-8">
              🚀 EntreSkillHub
            </Link>
            <h2 className="text-4xl font-bold mb-4">Welcome Back!</h2>
            <p className="text-xl text-white/80 mb-12">
              Continue your entrepreneurial journey and unlock your business potential.
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: '10K+', label: 'Users' },
                { value: '500+', label: 'Ideas' },
                { value: '95%', label: 'Success' },
              ].map((stat, i) => (
                <div key={i} className="glass p-4 rounded-2xl">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-white/70">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <Link to="/" className="text-3xl font-bold gradient-text">
                🚀 EntreSkillHub
              </Link>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-dark-900 dark:text-white mb-2">
                Sign In
              </h1>
              <p className="text-dark-500 dark:text-dark-400">
                Welcome back! Please enter your details.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="label">Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    className="input pl-12"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="label mb-0">Password</label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    className="input pl-12 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600"
                  >
                    {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="rememberMe"
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-dark-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="rememberMe" className="ml-2 text-sm text-dark-600 dark:text-dark-300">
                  Remember me for 30 days
                </label>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading} className="btn-primary w-full btn-lg">
                {loading ? (
                  <ButtonLoader text="Signing in..." />
                ) : (
                  <>
                    Sign In
                    <FiArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Sign Up Link */}
            <p className="text-center mt-8 text-dark-500 dark:text-dark-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
                Sign up for free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;