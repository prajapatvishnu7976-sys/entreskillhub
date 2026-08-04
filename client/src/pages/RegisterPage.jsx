// ============================================
// EntreSkillHub - Register Page
// ============================================

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiCheck } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { ButtonLoader } from '../components/common/Loader';
import { getPasswordStrength } from '../utils/helpers';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordStrength = getPasswordStrength(formData.password);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await register(formData);
    setLoading(false);
    if (result?.success) {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <>
      <Helmet>
        <title>Sign Up - EntreSkillHub</title>
      </Helmet>

      <div className="min-h-screen flex bg-dark-50 dark:bg-dark-900">
        {/* Left: Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="lg:hidden text-center mb-8">
              <Link to="/" className="text-3xl font-bold gradient-text">
                🚀 EntreSkillHub
              </Link>
            </div>

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-dark-900 dark:text-white mb-2">
                Create Account
              </h1>
              <p className="text-dark-500 dark:text-dark-400">
                Start your entrepreneurial journey today!
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className="label label-required">Full Name</label>
                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 w-5 h-5" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    className="input pl-12"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="label label-required">Email Address</label>
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
                <label className="label label-required">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min. 8 characters"
                    required
                    className="input pl-12 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400"
                  >
                    {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password Strength */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-dark-100 dark:bg-dark-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${passwordStrength.color}`}
                          style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium text-dark-500">
                        {passwordStrength.label}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="label label-required">Confirm Password</label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 w-5 h-5" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm password"
                    required
                    className="input pl-12 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400"
                  >
                    {showConfirm ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  id="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  required
                  className="mt-1 w-4 h-4 rounded border-dark-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="acceptTerms" className="text-sm text-dark-600 dark:text-dark-300">
                  I agree to the{' '}
                  <Link to="/terms" className="text-primary-600 hover:underline font-medium">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-primary-600 hover:underline font-medium">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full btn-lg">
                {loading ? (
                  <ButtonLoader text="Creating account..." />
                ) : (
                  <>
                    Create Account
                    <FiArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center mt-8 text-dark-500 dark:text-dark-400">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Right: Info */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-secondary-600 via-primary-600 to-secondary-800 items-center justify-center p-12">
          <div className="absolute inset-0 bg-grid opacity-20"></div>

          <div className="relative z-10 text-white max-w-md">
            <Link to="/" className="text-4xl font-bold text-white block mb-8">
              🚀 EntreSkillHub
            </Link>
            <h2 className="text-4xl font-bold mb-6">
              Start Your Entrepreneurial Journey!
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Join thousands of successful entrepreneurs building their dream businesses.
            </p>

            <div className="space-y-4">
              {[
                'Personalized business ideas',
                'Step-by-step roadmaps',
                'Expert mentorship',
                'Free learning resources',
                'Progress tracking',
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <FiCheck className="w-4 h-4" />
                  </div>
                  <span className="text-lg">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;