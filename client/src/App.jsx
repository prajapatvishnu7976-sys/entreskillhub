import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { PageLoader } from './components/common/Loader';
import ProtectedRoute, { PublicOnlyRoute } from './components/auth/ProtectedRoute';

const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const BusinessIdeasPage = lazy(() => import('./pages/BusinessIdeasPage'));
const BusinessIdeaDetailPage = lazy(() => import('./pages/BusinessIdeaDetailPage'));
const RoadmapsPage = lazy(() => import('./pages/RoadmapsPage'));
const RoadmapDetailPage = lazy(() => import('./pages/RoadmapDetailPage'));
const MentorsPage = lazy(() => import('./pages/MentorsPage'));
const MentorDetailPage = lazy(() => import('./pages/MentorDetailPage'));
const ResourcesPage = lazy(() => import('./pages/ResourcesPage'));
const ResourceDetailPage = lazy(() => import('./pages/ResourceDetailPage'));
const SkillAssessmentPage = lazy(() => import('./pages/SkillAssessmentPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const BookmarksPage = lazy(() => import('./pages/BookmarksPage'));
const SessionsPage = lazy(() => import('./pages/SessionsPage'));
const BecomeMentorPage = lazy(() => import('./pages/BecomeMentorPage'));
const MentorDashboardPage = lazy(() => import('./pages/MentorDashboardPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function App() {
  const { loading } = useAuth();
  if (loading) return <PageLoader message="Initializing EntreSkillHub..." />;

  return (
    <Suspense fallback={<PageLoader message="Loading page..." />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Business Ideas */}
        <Route path="/business-ideas" element={<BusinessIdeasPage />} />
        <Route path="/business-ideas/:identifier" element={<BusinessIdeaDetailPage />} />

        {/* Roadmaps */}
        <Route path="/roadmaps" element={<RoadmapsPage />} />
        <Route path="/roadmaps/:identifier" element={<RoadmapDetailPage />} />

        {/* Resources */}
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/resources/:identifier" element={<ResourceDetailPage />} />

        {/* Mentors */}
        <Route path="/mentors" element={<MentorsPage />} />
        <Route path="/mentors/:identifier" element={<MentorDetailPage />} />

        {/* Auth */}
        <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
        <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPasswordPage /></PublicOnlyRoute>} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

        {/* Protected User */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/skill-assessment" element={<ProtectedRoute><SkillAssessmentPage /></ProtectedRoute>} />
        <Route path="/bookmarks" element={<ProtectedRoute><BookmarksPage /></ProtectedRoute>} />
        <Route path="/sessions" element={<ProtectedRoute><SessionsPage /></ProtectedRoute>} />

        {/* Mentor */}
        <Route path="/become-mentor" element={<ProtectedRoute><BecomeMentorPage /></ProtectedRoute>} />
        <Route path="/mentor/dashboard" element={<ProtectedRoute roles={['mentor', 'admin', 'superadmin']}><MentorDashboardPage /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin/*" element={<ProtectedRoute roles={['admin', 'superadmin']}><AdminPage /></ProtectedRoute>} />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default App;