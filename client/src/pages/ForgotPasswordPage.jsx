// ============================================
// EntreSkillHub - Forgot Password Page
// ============================================

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiMail, FiArrowLeft, FiCheck } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { ButtonLoader } from '../components/common/Loader';

const ForgotPasswordPage = () => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await forgotPassword(email);
    setLoading(false);
    if (result?.success) {
      setSent(true);
    }
  };

  return (
    <>
      <Helmet>
        <title>Forgot Password - EntreSkillHub</title>
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 via-primary-900/30 to-dark-900 p-4">
        <div className="absolute inset-0 bg-grid opacity-20"></div>
        <div className="absolute top-0 -left-40 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-blob"></div>

        <div className="w-full max-w-md relative z-10">
          <div className="card p-8">
            <Link to="/login" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm mb-6">
              <FiArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>

            {sent ? (
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success-500 flex items-center justify-center">
                  <FiCheck className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold mb-3">Check Your Email!</h1>
                <p className="text-dark-500 mb-8">
                  We've sent a password reset link to <strong>{email}</strong>. Click the link to reset your password.
                </p>
                <Link to="/login" className="btn-primary w-full">
                  Back to Login
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <div className="text-6xl mb-4">🔐</div>
                  <h1 className="text-3xl font-bold mb-2">Forgot Password?</h1>
                  <p className="text-dark-500">Enter your email and we'll send you a reset link</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="label">Email Address</label>
                    <div className="relative">
                      <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 w-5 h-5" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="input pl-12"
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="btn-primary w-full btn-lg">
                    {loading ? <ButtonLoader text="Sending..." /> : 'Send Reset Link'}
                  </button>
                </form>

                <p className="text-center mt-6 text-sm text-dark-500">
                  Remember password?{' '}
                  <Link to="/login" className="text-primary-600 hover:underline font-semibold">
                    Sign in
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPasswordPage;