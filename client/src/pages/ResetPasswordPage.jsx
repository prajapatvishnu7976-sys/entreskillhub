// ============================================
// EntreSkillHub - Reset Password Page
// ============================================

import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiLock, FiEye, FiEyeOff, FiArrowLeft, FiCheck } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { ButtonLoader } from '../components/common/Loader';
import { getPasswordStrength } from '../utils/helpers';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const passwordStrength = getPasswordStrength(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return;
    }
    setLoading(true);
    const result = await resetPassword(token, formData);
    setLoading(false);
    if (result?.success) {
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    }
  };

  return (
    <>
      <Helmet>
        <title>Reset Password - EntreSkillHub</title>
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

            {success ? (
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success-500 flex items-center justify-center">
                  <FiCheck className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold mb-3">Password Reset!</h1>
                <p className="text-dark-500 mb-4">
                  Your password has been reset successfully.
                </p>
                <p className="text-sm text-dark-400">Redirecting to dashboard...</p>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <div className="text-6xl mb-4">🔐</div>
                  <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
                  <p className="text-dark-500">Enter your new password below</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="label label-required">New Password</label>
                    <div className="relative">
                      <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 w-5 h-5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

                    {formData.password && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-dark-100 dark:bg-dark-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${passwordStrength.color}`}
                              style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium">{passwordStrength.label}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="label label-required">Confirm Password</label>
                    <div className="relative">
                      <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 w-5 h-5" />
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="Confirm your password"
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
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className="text-xs text-danger-500 mt-1">Passwords don't match</p>
                    )}
                  </div>

                  <button type="submit" disabled={loading} className="btn-primary w-full btn-lg">
                    {loading ? <ButtonLoader text="Resetting..." /> : 'Reset Password'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPasswordPage;