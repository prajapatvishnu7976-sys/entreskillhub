// ============================================
// EntreSkillHub - Skill Assessment Page
// Interactive multi-step assessment
// ============================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  FiArrowRight, FiArrowLeft, FiCheck, FiCheckCircle,
  FiTarget, FiZap, FiUser, FiDollarSign, FiTrendingUp,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import { ButtonLoader } from '../components/common/Loader';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import skillService from '../services/skillService';
import {
  SKILL_CATEGORIES, ENTREPRENEURSHIP_STAGES, INVESTMENT_RANGES,
} from '../utils/constants';

const SkillAssessmentPage = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(true);

  const [formData, setFormData] = useState({
    entrepreneurshipStage: user?.entrepreneurshipStage || 'exploring',
    selectedCategories: [],
    selectedSkills: [],
    interests: [],
    budget: { min: 0, max: 25000 },
    goals: [],
    timeCommitment: 'part_time',
  });

  // Fetch skills
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await skillService.getAll({ limit: 50 });
        if (response.data.success) {
          setSkills(response.data.data);
        }
      } catch (error) {
        console.error('Failed to load skills:', error);
      } finally {
        setLoadingSkills(false);
      }
    };
    fetchSkills();
  }, []);

  const steps = [
    { id: 0, title: 'Welcome', icon: '👋' },
    { id: 1, title: 'Your Stage', icon: '🎯' },
    { id: 2, title: 'Skill Categories', icon: '🎨' },
    { id: 3, title: 'Your Skills', icon: '💪' },
    { id: 4, title: 'Interests', icon: '❤️' },
    { id: 5, title: 'Budget & Goals', icon: '💰' },
    { id: 6, title: 'Complete', icon: '✅' },
  ];

  const goalOptions = [
    { value: 'full_time_income', label: 'Full-time Income', icon: '💼' },
    { value: 'side_hustle', label: 'Side Hustle', icon: '⏰' },
    { value: 'financial_freedom', label: 'Financial Freedom', icon: '🏝️' },
    { value: 'flexibility', label: 'Work Flexibility', icon: '🌴' },
    { value: 'passion_project', label: 'Passion Project', icon: '❤️' },
    { value: 'help_others', label: 'Help Others', icon: '🤝' },
    { value: 'legacy', label: 'Build Legacy', icon: '🏛️' },
    { value: 'learn_grow', label: 'Learn & Grow', icon: '🌱' },
  ];

  const commitmentOptions = [
    { value: 'part_time', label: 'Part-Time', desc: '1-4 hours/day', icon: '⏰' },
    { value: 'full_time', label: 'Full-Time', desc: '8+ hours/day', icon: '💪' },
    { value: 'weekends', label: 'Weekends Only', desc: '10-15 hrs/week', icon: '📅' },
    { value: 'flexible', label: 'Flexible', desc: 'When possible', icon: '🌊' },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleSelection = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  };

  const toggleSkill = (skillId) => {
    setFormData((prev) => {
      const exists = prev.selectedSkills.find((s) => s.skill === skillId);
      return {
        ...prev,
        selectedSkills: exists
          ? prev.selectedSkills.filter((s) => s.skill !== skillId)
          : [...prev.selectedSkills, { skill: skillId, proficiency: 'intermediate' }],
      };
    });
  };

  const updateSkillProficiency = (skillId, proficiency) => {
    setFormData((prev) => ({
      ...prev,
      selectedSkills: prev.selectedSkills.map((s) =>
        s.skill === skillId ? { ...s, proficiency } : s
      ),
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Update profile
      await userService.updateProfile({
        entrepreneurshipStage: formData.entrepreneurshipStage,
        interests: formData.interests,
      });

      // Add skills
      if (formData.selectedSkills.length > 0) {
        await userService.addSkills({ skills: formData.selectedSkills });
      }

      // Update user context
      updateUser({
        entrepreneurshipStage: formData.entrepreneurshipStage,
        interests: formData.interests,
      });

      toast.success('🎉 Assessment complete! Redirecting to your recommendations...');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error) {
      toast.error('Failed to save assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return !!formData.entrepreneurshipStage;
      case 2: return formData.selectedCategories.length > 0;
      case 3: return formData.selectedSkills.length > 0;
      case 4: return formData.interests.length >= 2;
      case 5: return formData.goals.length > 0;
      default: return true;
    }
  };

  // Filter skills by selected categories
  const filteredSkills = skills.filter(
    (skill) =>
      formData.selectedCategories.length === 0 ||
      formData.selectedCategories.includes(skill.category)
  );

  return (
    <>
      <Helmet>
        <title>Skill Assessment - EntreSkillHub</title>
      </Helmet>

      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-dark-50 to-primary-50/30 dark:from-dark-900 dark:to-primary-900/10 py-8">
        <div className="container-custom max-w-4xl">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-semibold text-dark-700 dark:text-dark-200">
                Step {currentStep + 1} of {steps.length}
              </span>
              <span className="text-sm font-bold text-primary-600">
                {Math.round(((currentStep + 1) / steps.length) * 100)}%
              </span>
            </div>
            <div className="h-2 bg-dark-200 dark:bg-dark-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-500"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              ></div>
            </div>

            {/* Step Indicators */}
            <div className="flex justify-between mt-4 overflow-x-auto no-scrollbar">
              {steps.map((step, i) => (
                <div
                  key={step.id}
                  className={`flex flex-col items-center gap-1 min-w-[60px] ${
                    i <= currentStep ? 'text-primary-600' : 'text-dark-400'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all ${
                      i < currentStep
                        ? 'bg-success-500 text-white'
                        : i === currentStep
                        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/50 scale-110'
                        : 'bg-dark-100 dark:bg-dark-700'
                    }`}
                  >
                    {i < currentStep ? <FiCheck className="w-5 h-5" /> : step.icon}
                  </div>
                  <span className="text-xs font-medium hidden sm:block">{step.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Content Card */}
          <div className="card p-8 sm:p-12 min-h-[500px] animate-fade-in">
            {/* Step 0: Welcome */}
            {currentStep === 0 && (
              <div className="text-center">
                <div className="text-8xl mb-6 animate-bounce-in">🚀</div>
                <h1 className="text-4xl font-bold mb-4">
                  Welcome, <span className="gradient-text">{user?.name}!</span>
                </h1>
                <p className="text-xl text-dark-500 dark:text-dark-400 mb-8 max-w-2xl mx-auto">
                  Let's create your personalized entrepreneurial journey. This quick assessment takes just <strong>3 minutes</strong>.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
                  {[
                    { icon: '🎯', title: 'Personalized', desc: 'Tailored to you' },
                    { icon: '⚡', title: 'Quick', desc: 'Only 3 minutes' },
                    { icon: '🎁', title: 'Free Forever', desc: 'No hidden costs' },
                  ].map((benefit, i) => (
                    <div key={i} className="p-4 bg-primary-50 dark:bg-primary-500/10 rounded-2xl">
                      <div className="text-3xl mb-2">{benefit.icon}</div>
                      <div className="font-bold">{benefit.title}</div>
                      <div className="text-sm text-dark-500">{benefit.desc}</div>
                    </div>
                  ))}
                </div>

                <p className="text-sm text-dark-400">
                  We'll ask about your skills, interests, and goals to match you with perfect business ideas.
                </p>
              </div>
            )}

            {/* Step 1: Entrepreneurship Stage */}
            {currentStep === 1 && (
              <div>
                <h2 className="text-3xl font-bold mb-3">What's your current stage? 🎯</h2>
                <p className="text-dark-500 mb-8">
                  Select the option that best describes where you are right now.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {ENTREPRENEURSHIP_STAGES.map((stage) => (
                    <button
                      key={stage.value}
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, entrepreneurshipStage: stage.value }))
                      }
                      className={`p-6 rounded-2xl border-2 text-left transition-all ${
                        formData.entrepreneurshipStage === stage.value
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10 shadow-lg scale-105'
                          : 'border-dark-100 dark:border-dark-700 hover:border-primary-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-12 h-12 rounded-xl ${stage.color} flex items-center justify-center text-2xl`}>
                          {stage.icon}
                        </div>
                        <div>
                          <div className="text-xl font-bold">{stage.label}</div>
                        </div>
                        {formData.entrepreneurshipStage === stage.value && (
                          <FiCheckCircle className="w-6 h-6 text-primary-500 ml-auto" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Skill Categories */}
            {currentStep === 2 && (
              <div>
                <h2 className="text-3xl font-bold mb-3">Which categories interest you? 🎨</h2>
                <p className="text-dark-500 mb-8">
                  Select all that apply. Choose at least one to continue.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {SKILL_CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => toggleSelection('selectedCategories', cat.value)}
                      className={`relative p-5 rounded-2xl border-2 transition-all hover:scale-105 ${
                        formData.selectedCategories.includes(cat.value)
                          ? 'border-primary-500 bg-gradient-to-br ' + cat.color + ' text-white shadow-lg'
                          : 'border-dark-100 dark:border-dark-700 hover:border-primary-300'
                      }`}
                    >
                      {formData.selectedCategories.includes(cat.value) && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                          <FiCheck className="w-4 h-4 text-primary-500" />
                        </div>
                      )}
                      <div className="text-3xl mb-2">{cat.icon}</div>
                      <div className="text-xs font-semibold text-center line-clamp-2">{cat.value}</div>
                    </button>
                  ))}
                </div>

                <div className="mt-6 text-center text-sm text-dark-500">
                  Selected: <strong className="text-primary-600">{formData.selectedCategories.length}</strong>
                </div>
              </div>
            )}

            {/* Step 3: Skills */}
            {currentStep === 3 && (
              <div>
                <h2 className="text-3xl font-bold mb-3">What are your skills? 💪</h2>
                <p className="text-dark-500 mb-8">
                  Select your skills and set your proficiency level.
                </p>

                {loadingSkills ? (
                  <div className="text-center py-12">
                    <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
                  </div>
                ) : filteredSkills.length === 0 ? (
                  <div className="text-center py-12 text-dark-500">
                    <div className="text-5xl mb-4">🎯</div>
                    <p>No skills available in your selected categories yet.</p>
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="btn-outline btn-sm mt-4"
                    >
                      Change Categories
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                    {filteredSkills.map((skill) => {
                      const selected = formData.selectedSkills.find((s) => s.skill === skill._id);
                      return (
                        <div
                          key={skill._id}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            selected
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
                              : 'border-dark-100 dark:border-dark-700 hover:border-primary-300'
                          }`}
                        >
                          <button
                            onClick={() => toggleSkill(skill._id)}
                            className="w-full flex items-center gap-3 mb-3"
                          >
                            <div className="text-2xl">{skill.icon || '🎯'}</div>
                            <div className="flex-1 text-left">
                              <div className="font-bold">{skill.name}</div>
                              <div className="text-xs text-dark-500">{skill.category}</div>
                            </div>
                            {selected && <FiCheckCircle className="w-5 h-5 text-primary-500" />}
                          </button>

                          {selected && (
                            <div className="flex gap-1 mt-2">
                              {['beginner', 'intermediate', 'advanced', 'expert'].map((level) => (
                                <button
                                  key={level}
                                  onClick={() => updateSkillProficiency(skill._id, level)}
                                  className={`flex-1 py-1 px-2 text-xs rounded-lg capitalize transition-colors ${
                                    selected.proficiency === level
                                      ? 'bg-primary-500 text-white'
                                      : 'bg-white dark:bg-dark-700 text-dark-500 hover:bg-primary-100'
                                  }`}
                                >
                                  {level.slice(0, 3)}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="mt-4 text-center text-sm text-dark-500">
                  Selected: <strong className="text-primary-600">{formData.selectedSkills.length}</strong> skills
                </div>
              </div>
            )}

            {/* Step 4: Interests */}
            {currentStep === 4 && (
              <div>
                <h2 className="text-3xl font-bold mb-3">What are you interested in? ❤️</h2>
                <p className="text-dark-500 mb-8">
                  Type or select interests. Add at least 2 to continue.
                </p>

                {/* Popular Interests */}
                <div className="mb-6">
                  <h4 className="text-sm font-bold mb-3 text-dark-700 dark:text-dark-200">
                    Popular interests:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Cooking', 'Photography', 'Fitness', 'Fashion', 'Music', 'Art',
                      'Technology', 'Travel', 'Reading', 'Gaming', 'Yoga', 'Gardening',
                      'Dance', 'Writing', 'Sports', 'Movies', 'DIY', 'Beauty',
                    ].map((interest) => (
                      <button
                        key={interest}
                        onClick={() => toggleSelection('interests', interest)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          formData.interests.includes(interest)
                            ? 'bg-primary-500 text-white shadow-lg scale-105'
                            : 'bg-dark-100 dark:bg-dark-700 hover:bg-primary-100 dark:hover:bg-primary-500/20'
                        }`}
                      >
                        {formData.interests.includes(interest) && '✓ '}
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold mb-3">Add custom interest:</h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g., Sustainable living"
                      className="input flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.target.value.trim()) {
                          toggleSelection('interests', e.target.value.trim());
                          e.target.value = '';
                        }
                      }}
                    />
                    <button
                      onClick={(e) => {
                        const input = e.target.previousSibling;
                        if (input.value.trim()) {
                          toggleSelection('interests', input.value.trim());
                          input.value = '';
                        }
                      }}
                      className="btn-primary"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="mt-6 text-center text-sm text-dark-500">
                  Selected: <strong className="text-primary-600">{formData.interests.length}</strong> interests
                </div>
              </div>
            )}

            {/* Step 5: Budget & Goals */}
            {currentStep === 5 && (
              <div>
                <h2 className="text-3xl font-bold mb-3">Budget & Goals 💰</h2>
                <p className="text-dark-500 mb-8">
                  Help us understand your budget and what you want to achieve.
                </p>

                {/* Budget */}
                <div className="mb-8">
                  <h3 className="font-bold mb-3">What's your budget range?</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {INVESTMENT_RANGES.map((range, i) => (
                      <button
                        key={i}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            budget: { min: range.min, max: range.max === Infinity ? 99999999 : range.max },
                          }))
                        }
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          formData.budget.min === range.min
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
                            : 'border-dark-100 dark:border-dark-700 hover:border-primary-300'
                        }`}
                      >
                        <div className="text-2xl mb-1">{range.icon}</div>
                        <div className="font-bold text-sm">{range.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Commitment */}
                <div className="mb-8">
                  <h3 className="font-bold mb-3">How much time can you commit?</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {commitmentOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, timeCommitment: opt.value }))
                        }
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          formData.timeCommitment === opt.value
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
                            : 'border-dark-100 dark:border-dark-700 hover:border-primary-300'
                        }`}
                      >
                        <div className="text-2xl mb-1">{opt.icon}</div>
                        <div className="font-bold">{opt.label}</div>
                        <div className="text-xs text-dark-500">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Goals */}
                <div>
                  <h3 className="font-bold mb-3">What are your goals? (Select multiple)</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {goalOptions.map((goal) => (
                      <button
                        key={goal.value}
                        onClick={() => toggleSelection('goals', goal.value)}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${
                          formData.goals.includes(goal.value)
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10 scale-105'
                            : 'border-dark-100 dark:border-dark-700 hover:border-primary-300'
                        }`}
                      >
                        <div className="text-3xl mb-2">{goal.icon}</div>
                        <div className="text-xs font-semibold">{goal.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Complete */}
            {currentStep === 6 && (
              <div className="text-center">
                <div className="text-8xl mb-6 animate-bounce-in">🎉</div>
                <h2 className="text-4xl font-bold mb-4">
                  You're All Set, <span className="gradient-text">{user?.name}!</span>
                </h2>
                <p className="text-xl text-dark-500 mb-8 max-w-2xl mx-auto">
                  We've analyzed your profile. Get ready for personalized business recommendations!
                </p>

                {/* Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto mb-8">
                  <div className="p-4 bg-primary-50 dark:bg-primary-500/10 rounded-xl">
                    <div className="text-3xl mb-1">🎯</div>
                    <div className="text-2xl font-bold text-primary-600">
                      {formData.selectedSkills.length}
                    </div>
                    <div className="text-xs text-dark-500">Skills</div>
                  </div>
                  <div className="p-4 bg-secondary-50 dark:bg-secondary-500/10 rounded-xl">
                    <div className="text-3xl mb-1">❤️</div>
                    <div className="text-2xl font-bold text-secondary-600">
                      {formData.interests.length}
                    </div>
                    <div className="text-xs text-dark-500">Interests</div>
                  </div>
                  <div className="p-4 bg-accent-50 dark:bg-accent-500/10 rounded-xl">
                    <div className="text-3xl mb-1">🏆</div>
                    <div className="text-2xl font-bold text-accent-600">
                      {formData.goals.length}
                    </div>
                    <div className="text-xs text-dark-500">Goals</div>
                  </div>
                  <div className="p-4 bg-success-50 dark:bg-success-500/10 rounded-xl">
                    <div className="text-3xl mb-1">💡</div>
                    <div className="text-2xl font-bold text-success-600">100+</div>
                    <div className="text-xs text-dark-500">Matches</div>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn-primary btn-xl mx-auto"
                >
                  {loading ? (
                    <ButtonLoader text="Saving..." />
                  ) : (
                    <>
                      See My Recommendations
                      <FiArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Navigation Buttons */}
            {currentStep < steps.length - 1 && (
              <div className="flex items-center justify-between mt-12 pt-8 border-t border-dark-100 dark:border-dark-700">
                <button
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className="btn-outline disabled:opacity-30"
                >
                  <FiArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="btn-primary disabled:opacity-30"
                >
                  Continue
                  <FiArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SkillAssessmentPage;