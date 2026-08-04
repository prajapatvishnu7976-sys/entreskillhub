// ============================================
// EntreSkillHub - Contact/Feedback Page
// ============================================

import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiMail, FiPhone, FiMapPin, FiSend, FiMessageSquare } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { ButtonLoader } from '../components/common/Loader';
import { useAuth } from '../context/AuthContext';
import feedbackService from '../services/feedbackService';

const ContactPage = () => {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    feedbackType: 'general',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please login to send us a message');
      return;
    }

    setLoading(true);
    try {
      const response = await feedbackService.submit(formData);
      if (response.data.success) {
        toast.success('🎉 Message sent! We\'ll get back to you soon.');
        setFormData({ feedbackType: 'general', subject: '', message: '' });
      }
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact Us - EntreSkillHub</title>
      </Helmet>

      <Navbar />

      {/* Hero */}
      <section className="relative py-20 bg-gradient-to-br from-primary-600 via-secondary-600 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20"></div>
        <div className="container-custom relative z-10 text-center">
          <div className="text-6xl mb-4">💬</div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Get in Touch</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Have a question, suggestion, or feedback? We'd love to hear from you!
          </p>
        </div>
      </section>

      <section className="section bg-dark-50 dark:bg-dark-900">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info Cards */}
            <div className="space-y-4">
              {[
                { icon: FiMail, title: 'Email Us', value: 'hello@entreskillhub.com', color: 'from-blue-500 to-cyan-500' },
                { icon: FiPhone, title: 'Call Us', value: '+91 123 456 7890', color: 'from-green-500 to-emerald-500' },
                { icon: FiMapPin, title: 'Visit Us', value: 'Mumbai, Maharashtra\nIndia - 400001', color: 'from-purple-500 to-pink-500' },
              ].map((info, i) => (
                <div key={i} className="card p-6 hover:scale-105 transition-transform">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${info.color} flex items-center justify-center mb-4`}>
                    <info.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold mb-2">{info.title}</h3>
                  <p className="text-dark-500 whitespace-pre-line text-sm">{info.value}</p>
                </div>
              ))}
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              <div className="card p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <FiMessageSquare className="w-6 h-6" />
                  Send us a Message
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="label">Type of Message</label>
                    <select
                      value={formData.feedbackType}
                      onChange={(e) => setFormData({ ...formData, feedbackType: e.target.value })}
                      className="input"
                    >
                      <option value="general">💬 General Inquiry</option>
                      <option value="suggestion">💡 Suggestion</option>
                      <option value="feature_request">✨ Feature Request</option>
                      <option value="bug_report">🐛 Bug Report</option>
                      <option value="complaint">⚠️ Complaint</option>
                      <option value="compliment">❤️ Compliment</option>
                    </select>
                  </div>

                  <div>
                    <label className="label label-required">Subject</label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Brief subject of your message"
                      required
                      minLength="5"
                      maxLength="200"
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="label label-required">Your Message</label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Write your message here..."
                      required
                      minLength="10"
                      maxLength="5000"
                      rows="8"
                      className="textarea"
                    ></textarea>
                    <div className="text-xs text-dark-400 mt-1">
                      {formData.message.length}/5000 characters
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="btn-primary w-full btn-lg">
                    {loading ? <ButtonLoader text="Sending..." /> : (
                      <>
                        Send Message
                        <FiSend className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default ContactPage;