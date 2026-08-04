// ============================================
// EntreSkillHub - About Us Page
// ============================================

import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiTarget, FiUsers, FiHeart, FiTrendingUp, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const AboutPage = () => {
  return (
    <>
      <Helmet>
        <title>About Us - EntreSkillHub</title>
      </Helmet>

      <Navbar />

      {/* Hero */}
      <section className="relative py-20 bg-gradient-to-br from-primary-600 via-secondary-600 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20"></div>
        <div className="absolute top-0 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-blob"></div>

        <div className="container-custom relative z-10 text-center">
          <div className="text-7xl mb-6">🚀</div>
          <h1 className="text-5xl sm:text-6xl font-bold mb-6">
            Empowering <span className="text-yellow-300">Entrepreneurs</span>
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            We're on a mission to help millions of aspiring entrepreneurs transform their skills into successful businesses.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="section bg-white dark:bg-dark-900">
        <div className="container-custom max-w-4xl">
          <div className="text-center mb-16">
            <span className="badge-primary mb-4">Our Mission</span>
            <h2 className="text-4xl font-bold mb-6">Bridging Skills and Success</h2>
            <p className="text-xl text-dark-500 leading-relaxed">
              Many talented individuals have skills but lack the guidance to turn them into sustainable businesses. EntreSkillHub bridges this gap by providing personalized business ideas, step-by-step roadmaps, and expert mentorship.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: FiTarget, title: 'Our Vision', desc: 'Create a world where everyone has the resources to start their entrepreneurial journey with confidence.' },
              { icon: FiHeart, title: 'Our Values', desc: 'Empowerment, inclusivity, quality education, and unwavering support for every entrepreneur.' },
              { icon: FiUsers, title: 'Our Community', desc: 'Join 10,000+ entrepreneurs, 200+ mentors, and countless success stories building the future.' },
              { icon: FiTrendingUp, title: 'Our Impact', desc: 'Helped launch 500+ successful businesses and generated ₹100Cr+ in entrepreneurial revenue.' },
            ].map((item, i) => (
              <div key={i} className="card p-6 hover:scale-105 transition-transform">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mb-4">
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-dark-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="section bg-dark-50 dark:bg-dark-800">
        <div className="container-custom max-w-4xl">
          <div className="text-center mb-12">
            <span className="badge-secondary mb-4">Our Story</span>
            <h2 className="text-4xl font-bold mb-4">Where It All Started</h2>
          </div>

          <div className="card p-8 space-y-6 text-dark-600 dark:text-dark-300 leading-relaxed">
            <p>
              EntreSkillHub was born from a simple observation: <strong>millions of talented people possess valuable skills but lack the structured guidance to convert them into sustainable businesses.</strong>
            </p>
            <p>
              We saw tailors who could design amazing clothes but didn't know how to price them. Home cooks who made incredible food but couldn't scale their operations. Artists who created beautiful crafts but struggled to find customers.
            </p>
            <p>
              That's when we decided to build a platform that would democratize entrepreneurship — making expert guidance, proven roadmaps, and quality resources accessible to <strong>everyone, regardless of background or resources</strong>.
            </p>
            <p>
              Today, we're proud to be helping thousands of entrepreneurs across India (and soon, globally) transform their skills into thriving businesses. This is just the beginning.
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="section bg-white dark:bg-dark-900">
        <div className="container-custom">
          <div className="text-center mb-12">
            <span className="badge-accent mb-4" style={{ color: '#c2410c' }}>Our Team</span>
            <h2 className="text-4xl font-bold mb-4">Meet the People Behind EntreSkillHub</h2>
            <p className="text-xl text-dark-500 max-w-2xl mx-auto">
              A passionate team of entrepreneurs, educators, and technologists.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Prajapati Team', role: 'Founder & CEO', img: 15 },
              { name: 'Sarah Johnson', role: 'CTO', img: 45 },
              { name: 'Rahul Kumar', role: 'Head of Product', img: 12 },
              { name: 'Priya Sharma', role: 'Head of Content', img: 48 },
            ].map((member, i) => (
              <div key={i} className="card overflow-hidden hover:scale-105 transition-transform">
                <div className="h-48 bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                  <img
                    src={`https://i.pravatar.cc/200?img=${member.img}`}
                    alt={member.name}
                    className="w-32 h-32 rounded-full border-4 border-white shadow-xl"
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="font-bold text-lg">{member.name}</h3>
                  <p className="text-primary-600 text-sm">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-gradient-to-br from-primary-600 via-secondary-600 to-primary-700 text-white text-center">
        <div className="container-custom">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of successful entrepreneurs today
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="btn-glass btn-xl">
              Get Started Free
              <FiArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/business-ideas" className="btn-outline btn-xl text-white border-white hover:bg-white/10">
              Explore Ideas
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default AboutPage;