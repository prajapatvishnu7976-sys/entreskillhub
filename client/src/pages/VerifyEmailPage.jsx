// ============================================
// EntreSkillHub - Email Verification Page
// ============================================

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiCheck, FiX, FiMail } from 'react-icons/fi';
import api from '../services/api';
import { PageLoader } from '../components/common/Loader';

const VerifyEmailPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await api.get(`/auth/verify-email/${token}`);
      if (response.data.success) {
        setStatus('success');
        setMessage(response.data.message);
        setTimeout(() => navigate('/dashboard'), 3000);
      }
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Verification failed');
    }
  };

  if (status === 'verifying') return <PageLoader message="Verifying your email..." />;

  return (
    <>
      <Helmet>
        <title>Email Verification - EntreSkillHub</title>
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 via-primary-900/30 to-dark-900 p-4">
        <div className="w-full max-w-md">
          <div className="card p-8 text-center">
            {status === 'success' ? (
              <>
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success-500 flex items-center justify-center">
                  <FiCheck className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold mb-3">Email Verified! 🎉</h1>
                <p className="text-dark-500 mb-6">{message}</p>
                <p className="text-sm text-dark-400">Redirecting to your dashboard...</p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-danger-500 flex items-center justify-center">
                  <FiX className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold mb-3">Verification Failed</h1>
                <p className="text-dark-500 mb-6">{message}</p>
                <div className="flex gap-3 justify-center">
                  <Link to="/login" className="btn-outline">Login</Link>
                  <Link to="/register" className="btn-primary">Register</Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default VerifyEmailPage;