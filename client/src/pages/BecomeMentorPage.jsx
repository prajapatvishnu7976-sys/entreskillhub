// ============================================
// EntreSkillHub - Become a Mentor Page
// ============================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiCheck, FiArrowRight, FiArrowLeft, FiAward, FiDollarSign, FiUsers } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { ButtonLoader } from '../components/common/Loader';
import { useAuth } from '../context/AuthContext';
import mentorService from '../services/mentorService';

const BecomeMentorPage = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    tagline: '',
    professionalBio: '',
    totalExperience: 0,
    expertiseCategories: [],
    expertise: [{ area: '', yearsOfExperience: 0, proficiencyLevel: 'expert' }],
    mentorshipTypes: [],
    mentorshipMode: [],
    languages: [{ language: 'English', proficiency: 'fluent' }],
    pricing: {
      isFree: false,
      sessionRates: [{ duration: 60, price: 999, type: 'individual' }],
      firstSessionFree: false,
      currency: 'INR',
    },
    location: {
      country: 'India',
      city: '',
      isRemote: true,
    },
  });

  const categoryOptions = [
    'Business Strategy', 'Marketing', 'Finance', 'Digital & IT Skills',
    'Food & Catering', 'Beauty & Wellness', 'Tailoring & Fashion',
    'Handicrafts & Artisan', 'Legal', 'Operations',
  ];

  const mentorshipTypeOptions = [
    { value: 'one_on_one', label: '1-on-1 Sessions', icon: '👤' },
    { value: 'group_session', label: 'Group Sessions', icon: '👥' },
    { value: 'workshop', label: 'Workshops', icon: '🎓' },
    { value: 'q_and_a', label: 'Q&A Sessions', icon: '💬' },
    { value: 'strategy_session', label: 'Strategy Sessions', icon: '🎯' },
    { value: 'ongoing_mentorship', label: 'Ongoing Mentorship', icon: '🌱' },
  ];

  const steps = [
    { title: 'Intro', icon: '👋' },
    { title: 'Profile', icon: '📝' },
    { title: 'Expertise', icon: '💼' },
    { title: 'Services', icon: '🎯' },
    { title: 'Pricing', icon: '💰' },
  ];

  const toggleArray = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await mentorService.register(formData);
      if (response.data.success) {
        updateUser({ role: 'mentor' });
        toast.success('🎉 Application submitted! We\'ll review it soon.');
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Become a Mentor - EntreSkillHub</title>
      </Helmet>

      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-dark-50 to-primary-50/30 dark:from-dark-900 dark:to-primary-900/10 py-8">
        <div className="container-custom max-w-4xl">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-semibold">Step {step + 1} of {steps.length}</span>
              <span className="text-sm font-bold text-primary-600">
                {Math.round(((step + 1) / steps.length) * 100)}%
              </span>
            </div>
            <div className="h-2 bg-dark-200 dark:bg-dark-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-500"
                style={{ width: `${((step + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="card p-8 min-h-[500px]">
            {/* Step 0: Intro */}
            {step === 0 && (
              <div className="text-center animate-fade-in">
                <div className="text-8xl mb-6">👨‍🏫</div>
                <h1 className="text-4xl font-bold mb-4">
                  Become a <span className="gradient-text">Mentor</span>
                </h1>
                <p className="text-xl text-dark-500 mb-8 max-w-2xl mx-auto">
                  Share your expertise, inspire entrepreneurs, and earn while making a difference.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 max-w-3xl mx-auto">
                  {[
                    { icon: FiDollarSign, title: 'Earn Money', desc: 'Set your own rates' },
                    { icon: FiUsers, title: 'Help Others', desc: 'Guide entrepreneurs' },
                    { icon: FiAward, title: 'Build Reputation', desc: 'Grow your brand' },
                  ].map((b, i) => (
                    <div key={i} className="p-6 bg-primary-50 dark:bg-primary-500/10 rounded-2xl text-center">
                      <b.icon className="w-10 h-10 mx-auto mb-3 text-primary-500" />
                      <div className="font-bold mb-1">{b.title}</div>
                      <div className="text-sm text-dark-500">{b.desc}</div>
                    </div>
                  ))}
                </div>

                <div className="text-left max-w-2xl mx-auto">
                  <h3 className="font-bold mb-3">Requirements:</h3>
                  <ul className="space-y-2">
                    {[
                      'Minimum 3 years of professional experience',
                      'Expertise in a specific field or industry',
                      'Passion for teaching and helping others',
                      'Reliable internet connection for online sessions',
                    ].map((req, i) => (
                      <li key={i} className="flex items-center gap-2 text-dark-600 dark:text-dark-300">
                        <FiCheck className="w-4 h-4 text-success-500" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Step 1: Profile */}
            {step === 1 && (
              <div className="animate-fade-in">
                <h2 className="text-3xl font-bold mb-6">Your Professional Profile</h2>

                <div className="space-y-4">
                  <div>
                    <label className="label label-required">Professional Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Senior Marketing Consultant"
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="label">Tagline (short catchy phrase)</label>
                    <input
                      type="text"
                      value={formData.tagline}
                      onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                      placeholder="e.g., Helping small businesses grow 10x"
                      maxLength="200"
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="label label-required">Professional Bio</label>
                    <textarea
                      value={formData.professionalBio}
                      onChange={(e) => setFormData({ ...formData, professionalBio: e.target.value })}
                      placeholder="Tell us about your background, expertise, and what makes you a great mentor..."
                      rows="6"
                      maxLength="3000"
                      className="textarea"
                    ></textarea>
                    <div className="text-xs text-dark-400 mt-1">
                      {formData.professionalBio.length}/3000 · Min 50 characters
                    </div>
                  </div>

                  <div>
                    <label className="label label-required">Years of Experience</label>
                    <input
                      type="number"
                      value={formData.totalExperience}
                      onChange={(e) => setFormData({ ...formData, totalExperience: parseInt(e.target.value) || 0 })}
                      min="0"
                      max="60"
                      className="input"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Expertise */}
            {step === 2 && (
              <div className="animate-fade-in">
                <h2 className="text-3xl font-bold mb-3">Your Expertise</h2>
                <p className="text-dark-500 mb-6">Select all areas you're an expert in</p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categoryOptions.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => toggleArray('expertiseCategories', cat)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        formData.expertiseCategories.includes(cat)
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
                          : 'border-dark-100 dark:border-dark-700 hover:border-primary-300'
                      }`}
                    >
                      <div className="font-medium text-sm">{cat}</div>
                    </button>
                  ))}
                </div>

                <div className="mt-6 text-sm text-dark-500">
                  Selected: <strong className="text-primary-600">{formData.expertiseCategories.length}</strong>
                </div>
              </div>
            )}

            {/* Step 3: Services */}
            {step === 3 && (
              <div className="animate-fade-in">
                <h2 className="text-3xl font-bold mb-3">Mentorship Services</h2>
                <p className="text-dark-500 mb-6">What type of mentorship do you offer?</p>

                <div className="mb-8">
                  <h3 className="font-bold mb-3">Session Types</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {mentorshipTypeOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => toggleArray('mentorshipTypes', opt.value)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.mentorshipTypes.includes(opt.value)
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
                            : 'border-dark-100 dark:border-dark-700 hover:border-primary-300'
                        }`}
                      >
                        <div className="text-3xl mb-1">{opt.icon}</div>
                        <div className="text-sm font-medium">{opt.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold mb-3">Mode of Sessions</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {['online', 'in_person', 'hybrid'].map((mode) => (
                      <button
                        key={mode}
                        onClick={() => toggleArray('mentorshipMode', mode)}
                        className={`p-4 rounded-xl border-2 capitalize transition-all ${
                          formData.mentorshipMode.includes(mode)
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
                            : 'border-dark-100 dark:border-dark-700 hover:border-primary-300'
                        }`}
                      >
                        {mode.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Pricing */}
            {step === 4 && (
              <div className="animate-fade-in">
                <h2 className="text-3xl font-bold mb-3">Set Your Pricing</h2>
                <p className="text-dark-500 mb-6">How much will you charge per session?</p>

                <div className="mb-6 p-4 bg-primary-50 dark:bg-primary-500/10 rounded-xl">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.pricing.isFree}
                      onChange={(e) => setFormData({
                        ...formData,
                        pricing: { ...formData.pricing, isFree: e.target.checked }
                      })}
                      className="w-5 h-5 rounded"
                    />
                    <span className="font-medium">Offer free mentorship</span>
                  </label>
                </div>

                {!formData.pricing.isFree && (
                  <div className="space-y-4">
                    <div>
                      <label className="label">Session Rate (₹ per session)</label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm text-dark-500 mb-1 block">Duration (min)</label>
                          <input
                            type="number"
                            value={formData.pricing.sessionRates[0].duration}
                            onChange={(e) => {
                              const rates = [...formData.pricing.sessionRates];
                              rates[0].duration = parseInt(e.target.value) || 60;
                              setFormData({
                                ...formData,
                                pricing: { ...formData.pricing, sessionRates: rates }
                              });
                            }}
                            className="input"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-dark-500 mb-1 block">Price (₹)</label>
                          <input
                            type="number"
                            value={formData.pricing.sessionRates[0].price}
                            onChange={(e) => {
                              const rates = [...formData.pricing.sessionRates];
                              rates[0].price = parseInt(e.target.value) || 0;
                              setFormData({
                                ...formData,
                                pricing: { ...formData.pricing, sessionRates: rates }
                              });
                            }}
                            className="input"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-yellow-50 dark:bg-yellow-500/10 rounded-xl">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.pricing.firstSessionFree}
                          onChange={(e) => setFormData({
                            ...formData,
                            pricing: { ...formData.pricing, firstSessionFree: e.target.checked }
                          })}
                          className="w-5 h-5 rounded"
                        />
                        <span className="font-medium">🎁 Offer first session FREE to build reviews</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-12 pt-8 border-t border-dark-100 dark:border-dark-700">
              <button
                onClick={() => setStep(step - 1)}
                disabled={step === 0}
                className="btn-outline disabled:opacity-30"
              >
                <FiArrowLeft className="w-4 h-4" /> Back
              </button>

              {step < steps.length - 1 ? (
                <button onClick={() => setStep(step + 1)} className="btn-primary">
                  Continue <FiArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={loading} className="btn-primary">
                  {loading ? <ButtonLoader text="Submitting..." /> : (
                    <>Submit Application <FiCheck className="w-4 h-4" /></>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default BecomeMentorPage;