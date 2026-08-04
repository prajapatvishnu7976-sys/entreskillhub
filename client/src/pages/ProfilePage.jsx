// ============================================
// EntreSkillHub - User Profile Page
// ============================================

import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  FiCamera, FiEdit2, FiSave, FiX, FiMapPin, FiBriefcase,
  FiCalendar, FiMail, FiPhone, FiUser, FiAward, FiTarget,
  FiLinkedin, FiTwitter, FiGlobe, FiInstagram, FiGithub,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { ButtonLoader } from '../components/common/Loader';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import { getInitials, formatDate, capitalize } from '../utils/helpers';
import { ENTREPRENEURSHIP_STAGES } from '../utils/constants';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeTab, setActiveTab] = useState('about');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
    gender: user?.gender || 'prefer_not_to_say',
    entrepreneurshipStage: user?.entrepreneurshipStage || 'exploring',
    location: {
      country: user?.location?.country || 'India',
      state: user?.location?.state || '',
      city: user?.location?.city || '',
      pincode: user?.location?.pincode || '',
      address: user?.location?.address || '',
    },
    education: {
      level: user?.education?.level || 'other',
      field: user?.education?.field || '',
      institution: user?.education?.institution || '',
    },
    occupation: {
      current: user?.occupation?.current || '',
      experience: user?.occupation?.experience || 0,
      industry: user?.occupation?.industry || '',
    },
    socialLinks: {
      linkedin: user?.socialLinks?.linkedin || '',
      twitter: user?.socialLinks?.twitter || '',
      facebook: user?.socialLinks?.facebook || '',
      instagram: user?.socialLinks?.instagram || '',
      website: user?.socialLinks?.website || '',
    },
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const uploadData = new FormData();
    uploadData.append('profileImage', file);

    setUploadingImage(true);
    try {
      const response = await userService.uploadProfileImage(uploadData);
      if (response.data.success) {
        updateUser({ profileImage: response.data.data.profileImage });
        toast.success('Profile image updated!');
      }
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleChange = (path, value) => {
    if (path.includes('.')) {
      const [parent, child] = path.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [path]: value }));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await userService.updateProfile(formData);
      if (response.data.success) {
        updateUser(response.data.data.user);
        toast.success('✅ Profile updated successfully!');
        setEditing(false);
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'about', label: 'About', icon: FiUser },
    { id: 'skills', label: 'Skills', icon: FiAward },
    { id: 'activity', label: 'Activity', icon: FiTarget },
  ];

  const currentStage = ENTREPRENEURSHIP_STAGES.find((s) => s.value === user?.entrepreneurshipStage);

  return (
    <>
      <Helmet>
        <title>My Profile - EntreSkillHub</title>
      </Helmet>

      <Navbar />

      <div className="min-h-screen bg-dark-50 dark:bg-dark-900 pb-16">
        {/* Cover Section */}
        <div className="relative h-48 sm:h-64 bg-gradient-to-br from-primary-600 via-secondary-600 to-primary-800 overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-20"></div>
          <div className="absolute top-0 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-blob"></div>
        </div>

        <div className="container-custom">
          {/* Profile Header */}
          <div className="relative -mt-24 mb-8">
            <div className="card p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
                {/* Avatar */}
                <div className="relative -mt-16 sm:-mt-24">
                  {user?.profileImage?.url ? (
                    <img
                      src={user.profileImage.url}
                      alt={user.name}
                      className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl object-cover border-4 border-white dark:border-dark-800 shadow-xl"
                    />
                  ) : (
                    <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-4xl font-bold text-white border-4 border-white dark:border-dark-800 shadow-xl">
                      {getInitials(user?.name)}
                    </div>
                  )}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="absolute bottom-2 right-2 w-10 h-10 bg-primary-500 hover:bg-primary-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
                  >
                    {uploadingImage ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FiCamera className="w-5 h-5" />
                    )}
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h1 className="text-3xl sm:text-4xl font-bold text-dark-900 dark:text-white">
                      {user?.name}
                    </h1>
                    {user?.isEmailVerified && (
                      <span className="badge-success text-xs">✓ Verified</span>
                    )}
                    <span className="badge-primary text-xs uppercase">
                      {user?.role}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-dark-500 mb-3">
                    <div className="flex items-center gap-1">
                      <FiMail className="w-4 h-4" />
                      {user?.email}
                    </div>
                    {user?.location?.city && (
                      <div className="flex items-center gap-1">
                        <FiMapPin className="w-4 h-4" />
                        {user.location.city}, {user.location.state}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <FiCalendar className="w-4 h-4" />
                      Joined {formatDate(user?.createdAt)}
                    </div>
                  </div>

                  {currentStage && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-500/20 text-primary-700 dark:text-primary-300 text-sm font-medium">
                      {currentStage.icon} {currentStage.label}
                    </div>
                  )}

                  {user?.bio && !editing && (
                    <p className="text-dark-600 dark:text-dark-300 mt-4 leading-relaxed">
                      {user.bio}
                    </p>
                  )}
                </div>

                {/* Edit Button */}
                <div>
                  {!editing ? (
                    <button onClick={() => setEditing(true)} className="btn-primary">
                      <FiEdit2 className="w-4 h-4" />
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditing(false)}
                        className="btn-outline"
                      >
                        <FiX className="w-4 h-4" />
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={loading}
                        className="btn-primary"
                      >
                        {loading ? <ButtonLoader text="Saving..." /> : (
                          <>
                            <FiSave className="w-4 h-4" />
                            Save
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-dark-100 dark:border-dark-700">
                <div className="text-center">
                  <div className="text-3xl font-bold gradient-text-primary">
                    {user?.skills?.length || 0}
                  </div>
                  <div className="text-sm text-dark-500">Skills</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold gradient-text-primary">
                    {user?.interests?.length || 0}
                  </div>
                  <div className="text-sm text-dark-500">Interests</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold gradient-text-primary">
                    {user?.savedBusinessIdeas?.length || 0}
                  </div>
                  <div className="text-sm text-dark-500">Saved Ideas</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold gradient-text-primary">
                    {user?.completedRoadmaps?.length || 0}
                  </div>
                  <div className="text-sm text-dark-500">Completed</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'bg-white dark:bg-dark-800 hover:bg-dark-100 dark:hover:bg-dark-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'about' && (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Personal Info */}
              <div className="lg:col-span-2 space-y-6">
                <div className="card p-6">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <FiUser className="w-5 h-5" />
                    Personal Information
                  </h3>

                  {editing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="label">Full Name</label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className="input"
                          />
                        </div>
                        <div>
                          <label className="label">Phone</label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleChange('phone', e.target.value)}
                            className="input"
                          />
                        </div>
                        <div>
                          <label className="label">Date of Birth</label>
                          <input
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                            className="input"
                          />
                        </div>
                        <div>
                          <label className="label">Gender</label>
                          <select
                            value={formData.gender}
                            onChange={(e) => handleChange('gender', e.target.value)}
                            className="input"
                          >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                            <option value="prefer_not_to_say">Prefer not to say</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="label">Bio</label>
                        <textarea
                          value={formData.bio}
                          onChange={(e) => handleChange('bio', e.target.value)}
                          rows="4"
                          maxLength="500"
                          className="textarea"
                          placeholder="Tell us about yourself..."
                        ></textarea>
                        <div className="text-xs text-dark-400 mt-1">
                          {formData.bio.length}/500 characters
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <ProfileField label="Email" value={user?.email} icon={FiMail} />
                      <ProfileField label="Phone" value={user?.phone || 'Not provided'} icon={FiPhone} />
                      <ProfileField
                        label="Date of Birth"
                        value={user?.dateOfBirth ? formatDate(user.dateOfBirth) : 'Not provided'}
                        icon={FiCalendar}
                      />
                      <ProfileField
                        label="Gender"
                        value={user?.gender ? capitalize(user.gender.replace('_', ' ')) : 'Not specified'}
                        icon={FiUser}
                      />
                    </div>
                  )}
                </div>

                {/* Location */}
                <div className="card p-6">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <FiMapPin className="w-5 h-5" />
                    Location
                  </h3>

                  {editing ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label">Country</label>
                        <input
                          type="text"
                          value={formData.location.country}
                          onChange={(e) => handleChange('location.country', e.target.value)}
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="label">State</label>
                        <input
                          type="text"
                          value={formData.location.state}
                          onChange={(e) => handleChange('location.state', e.target.value)}
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="label">City</label>
                        <input
                          type="text"
                          value={formData.location.city}
                          onChange={(e) => handleChange('location.city', e.target.value)}
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="label">Pincode</label>
                        <input
                          type="text"
                          value={formData.location.pincode}
                          onChange={(e) => handleChange('location.pincode', e.target.value)}
                          className="input"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-dark-600 dark:text-dark-300">
                      {[
                        user?.location?.address,
                        user?.location?.city,
                        user?.location?.state,
                        user?.location?.country,
                        user?.location?.pincode,
                      ].filter(Boolean).join(', ') || 'Location not provided'}
                    </div>
                  )}
                </div>

                {/* Occupation & Education */}
                <div className="card p-6">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <FiBriefcase className="w-5 h-5" />
                    Occupation & Education
                  </h3>

                  {editing ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label">Current Occupation</label>
                        <input
                          type="text"
                          value={formData.occupation.current}
                          onChange={(e) => handleChange('occupation.current', e.target.value)}
                          className="input"
                          placeholder="e.g., Freelancer"
                        />
                      </div>
                      <div>
                        <label className="label">Years of Experience</label>
                        <input
                          type="number"
                          value={formData.occupation.experience}
                          onChange={(e) => handleChange('occupation.experience', parseInt(e.target.value) || 0)}
                          className="input"
                          min="0"
                          max="60"
                        />
                      </div>
                      <div>
                        <label className="label">Industry</label>
                        <input
                          type="text"
                          value={formData.occupation.industry}
                          onChange={(e) => handleChange('occupation.industry', e.target.value)}
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="label">Education Level</label>
                        <select
                          value={formData.education.level}
                          onChange={(e) => handleChange('education.level', e.target.value)}
                          className="input"
                        >
                          <option value="no_formal_education">No Formal Education</option>
                          <option value="primary">Primary</option>
                          <option value="secondary">Secondary</option>
                          <option value="higher_secondary">Higher Secondary</option>
                          <option value="diploma">Diploma</option>
                          <option value="undergraduate">Undergraduate</option>
                          <option value="postgraduate">Postgraduate</option>
                          <option value="doctorate">Doctorate</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-dark-600 dark:text-dark-300">
                      <div>
                        <div className="text-sm text-dark-400 mb-1">Occupation</div>
                        <div className="font-medium">{user?.occupation?.current || 'Not specified'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-dark-400 mb-1">Experience</div>
                        <div className="font-medium">{user?.occupation?.experience || 0} years</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="space-y-6">
                {/* Social Links */}
                <div className="card p-6">
                  <h3 className="text-lg font-bold mb-4">Social Links</h3>

                  {editing ? (
                    <div className="space-y-3">
                      {[
                        { key: 'linkedin', icon: FiLinkedin, placeholder: 'LinkedIn URL' },
                        { key: 'twitter', icon: FiTwitter, placeholder: 'Twitter URL' },
                        { key: 'instagram', icon: FiInstagram, placeholder: 'Instagram URL' },
                        { key: 'website', icon: FiGlobe, placeholder: 'Website URL' },
                      ].map((social) => (
                        <div key={social.key} className="flex items-center gap-2">
                          <social.icon className="w-5 h-5 text-dark-400" />
                          <input
                            type="url"
                            value={formData.socialLinks[social.key]}
                            onChange={(e) => handleChange(`socialLinks.${social.key}`, e.target.value)}
                            placeholder={social.placeholder}
                            className="input text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {Object.entries(user?.socialLinks || {}).map(([key, value]) => {
                        if (!value) return null;
                        const icons = {
                          linkedin: FiLinkedin,
                          twitter: FiTwitter,
                          instagram: FiInstagram,
                          website: FiGlobe,
                          github: FiGithub,
                        };
                        const Icon = icons[key] || FiGlobe;
                        return (
                          <a
                            key={key}
                            href={value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-500/10 text-primary-600 transition-colors"
                          >
                            <Icon className="w-5 h-5" />
                            <span className="text-sm truncate">{capitalize(key)}</span>
                          </a>
                        );
                      })}
                      {Object.values(user?.socialLinks || {}).every((v) => !v) && (
                        <p className="text-sm text-dark-400">No social links added</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Interests */}
                <div className="card p-6">
                  <h3 className="text-lg font-bold mb-4">Interests</h3>
                  {user?.interests?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {user.interests.map((interest, i) => (
                        <span key={i} className="px-3 py-1 bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300 rounded-full text-sm">
                          {interest}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-dark-400">
                      No interests added.{' '}
                      <a href="/skill-assessment" className="text-primary-600 hover:underline">
                        Take assessment
                      </a>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Skills Tab */}
          {activeTab === 'skills' && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">My Skills</h3>
                <a href="/skill-assessment" className="btn-primary btn-sm">
                  Update Skills
                </a>
              </div>

              {user?.skills?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {user.skills.map((skillItem, i) => (
                    <div key={i} className="p-4 border border-dark-100 dark:border-dark-700 rounded-xl">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-2xl">{skillItem.skill?.icon || '🎯'}</div>
                        <div>
                          <div className="font-bold">{skillItem.skill?.name || 'Skill'}</div>
                          <div className="text-xs text-dark-500 capitalize">
                            {skillItem.proficiency}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="font-bold mb-2">No skills added yet</h3>
                  <p className="text-dark-500 mb-4">Take our skill assessment to get personalized recommendations</p>
                  <a href="/skill-assessment" className="btn-primary">
                    Take Assessment
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="card p-6">
              <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="font-bold mb-2">Activity coming soon</h3>
                <p className="text-dark-500">Your recent activities will appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

const ProfileField = ({ label, value, icon: Icon }) => (
  <div>
    <div className="text-sm text-dark-400 mb-1 flex items-center gap-1">
      {Icon && <Icon className="w-3 h-3" />}
      {label}
    </div>
    <div className="font-medium text-dark-900 dark:text-white">{value}</div>
  </div>
);

export default ProfilePage;