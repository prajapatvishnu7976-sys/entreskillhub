import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  FiArrowRight, FiZap, FiTarget, FiTrendingUp, FiUsers, FiBook,
  FiAward, FiCheckCircle, FiPlay, FiStar, FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import {
  HERO_STATS, PLATFORM_FEATURES, HOW_IT_WORKS_STEPS,
  TESTIMONIALS, BUSINESS_CATEGORIES,
} from '../utils/constants';

const HomePage = () => {
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState({ users: 0, ideas: 0, mentors: 0, success: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const targets = { users: 10000, ideas: 500, mentors: 200, success: 95 };
    const duration = 2000;
    const steps = 50;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      setVisibleCount({
        users: Math.floor(targets.users * progress),
        ideas: Math.floor(targets.ideas * progress),
        mentors: Math.floor(targets.mentors * progress),
        success: Math.floor(targets.success * progress),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, []);

  const nextTestimonial = () => setTestimonialIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  const prevTestimonial = () => setTestimonialIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);

  return (
    <>
      <Helmet>
        <title>EntreSkillHub - Transform Skills into Successful Businesses</title>
        <meta name="description" content="Join 10,000+ entrepreneurs. Get personalized business ideas, step-by-step roadmaps, and expert mentorship." />
      </Helmet>

      <Navbar />

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center pt-20 pb-20 overflow-hidden bg-gradient-to-br from-dark-900 via-primary-900/30 to-dark-900">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 -left-40 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute top-1/2 -right-40 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
          <div className="absolute inset-0 bg-grid opacity-30"></div>
        </div>

        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/20 text-white text-sm font-medium mb-6 animate-fade-in-down">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                🎉 Join 10,000+ Successful Entrepreneurs
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold font-display mb-6 animate-fade-in-up">
                <span className="text-white block mb-2">Turn Your</span>
                <span className="gradient-text block mb-2">Skills</span>
                <span className="text-white block">Into a Business</span>
              </h1>

              <p className="text-lg sm:text-xl text-dark-300 mb-8 max-w-xl mx-auto lg:mx-0 animate-fade-in-up animate-delay-200 leading-relaxed">
                Get personalized business ideas, expert mentorship, and step-by-step roadmaps to launch your dream business today.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10 animate-fade-in-up animate-delay-300">
                <Link to="/register" className="btn-primary btn-xl group w-full sm:w-auto">
                  Get Started Free
                  <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button
                  onClick={() => {
                    const el = document.getElementById('how-it-works');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="btn-glass btn-xl group w-full sm:w-auto"
                >
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FiPlay className="w-4 h-4 ml-0.5" />
                  </div>
                  How It Works
                </button>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-6 text-dark-400 text-sm animate-fade-in-up animate-delay-500">
                <div className="flex items-center gap-1"><FiCheckCircle className="text-green-500" /><span>Free forever</span></div>
                <div className="flex items-center gap-1"><FiCheckCircle className="text-green-500" /><span>No credit card</span></div>
                <div className="flex items-center gap-1"><FiCheckCircle className="text-green-500" /><span>Cancel anytime</span></div>
              </div>
            </div>

            <div className="relative animate-fade-in-up animate-delay-300">
              <div className="relative z-10 card-glass p-8 rounded-3xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-2xl">🎯</div>
                  <div>
                    <div className="font-bold text-white">Your Business Journey</div>
                    <div className="text-sm text-dark-400">Personalized for you</div>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { step: 'Skill Assessment', progress: 100, color: 'bg-green-500' },
                    { step: 'Business Idea Match', progress: 100, color: 'bg-blue-500' },
                    { step: 'Roadmap Planning', progress: 75, color: 'bg-purple-500' },
                    { step: 'Launch Business', progress: 45, color: 'bg-orange-500' },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm text-white mb-1">
                        <span>{item.step}</span>
                        <span className="font-bold">{item.progress}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full transition-all duration-1000`} style={{ width: `${item.progress}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-primary-500/20 to-secondary-500/20 border border-white/10 flex items-center gap-3">
                  <div className="text-3xl">🏆</div>
                  <div className="flex-1">
                    <div className="font-bold text-white">Level Up!</div>
                    <div className="text-xs text-dark-300">You earned 50 XP</div>
                  </div>
                </div>
              </div>

              <div className="absolute -top-6 -right-6 z-20 card-glass p-4 rounded-2xl animate-float">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <FiTrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">+150% Growth</div>
                    <div className="text-xs text-dark-400">This month</div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-6 z-20 card-glass p-4 rounded-2xl animate-float animation-delay-2000">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[45, 12, 48].map((img) => (
                      <img key={img} src={`https://i.pravatar.cc/40?img=${img}`} alt="" className="w-8 h-8 rounded-full border-2 border-dark-900" />
                    ))}
                  </div>
                  <div><div className="text-xs font-bold text-white">+2.5K joined today</div></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up animate-delay-700">
            {[
              { value: `${visibleCount.users.toLocaleString()}+`, label: 'Entrepreneurs', icon: '👥' },
              { value: `${visibleCount.ideas}+`, label: 'Business Ideas', icon: '💡' },
              { value: `${visibleCount.mentors}+`, label: 'Expert Mentors', icon: '🎓' },
              { value: `${visibleCount.success}%`, label: 'Success Rate', icon: '⭐' },
            ].map((stat, i) => (
              <div key={i} className="card-glass p-6 text-center hover:scale-105 transition-transform">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-3xl sm:text-4xl font-bold gradient-text mb-1">{stat.value}</div>
                <div className="text-dark-300 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="section bg-white dark:bg-dark-900 relative">
        <div className="container-custom">
          <div className="text-center mb-16">
            <span className="badge-primary mb-4">✨ Powerful Features</span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Everything You Need to <span className="gradient-text">Succeed</span></h2>
            <p className="text-xl text-dark-500 dark:text-dark-400 max-w-2xl mx-auto">From idea to launch, we've got you covered.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PLATFORM_FEATURES.map((feature, i) => (
              <div key={i} className="card-hover p-8 group cursor-pointer">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-3xl mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-dark-900 dark:text-white">{feature.title}</h3>
                <p className="text-dark-500 dark:text-dark-400 leading-relaxed">{feature.description}</p>
                <Link to="/register" className="inline-flex items-center gap-2 mt-4 text-primary-600 dark:text-primary-400 font-semibold text-sm group/link">
                  Learn more <FiArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="section bg-dark-50 dark:bg-dark-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30"></div>
        <div className="container-custom relative">
          <div className="text-center mb-16">
            <span className="badge-secondary mb-4">🗺️ Simple Process</span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">How It <span className="gradient-text">Works</span></h2>
            <p className="text-xl text-dark-500 dark:text-dark-400 max-w-2xl mx-auto">Follow our proven 5-step process.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {HOW_IT_WORKS_STEPS.map((step, i) => (
              <div key={i} className="relative group">
                {i < HOW_IT_WORKS_STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 -z-10 opacity-30"></div>
                )}
                <div className="card-hover p-6 text-center h-full">
                  <div className="relative inline-block mb-4">
                    <div className={`w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br ${step.color} flex items-center justify-center text-4xl shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all`}>
                      {step.icon}
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-white dark:bg-dark-900 rounded-full flex items-center justify-center text-sm font-bold text-primary-600 shadow-lg border-2 border-primary-500">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-dark-900 dark:text-white">{step.title}</h3>
                  <p className="text-sm text-dark-500 dark:text-dark-400 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/register" className="btn-primary btn-lg">Start Your Journey <FiArrowRight className="w-5 h-5" /></Link>
          </div>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="section bg-white dark:bg-dark-900">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Find Ideas in <span className="gradient-text">Your Field</span></h2>
            <p className="text-xl text-dark-500 dark:text-dark-400 max-w-2xl mx-auto">Browse business ideas across 15+ categories.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {BUSINESS_CATEGORIES.slice(0, 10).map((cat, i) => (
              <Link key={i} to={`/business-ideas?category=${encodeURIComponent(cat.value)}`} className="group relative overflow-hidden rounded-2xl p-6 text-center hover:scale-105 transition-all">
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-90`}></div>
                <div className="relative z-10">
                  <div className="text-4xl mb-3">{cat.icon}</div>
                  <div className="font-bold text-white text-sm">{cat.value}</div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/business-ideas" className="btn-outline btn-lg">View All Categories <FiArrowRight className="w-5 h-5" /></Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="section bg-gradient-to-br from-primary-600 via-secondary-600 to-primary-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-10"></div>
        <div className="container-custom relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Loved by <span className="text-yellow-300">Thousands</span></h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">Real stories from real entrepreneurs.</p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="card-glass p-8 md:p-12 rounded-3xl relative">
              <div className="absolute top-6 left-6 text-6xl text-white/20 font-serif leading-none">"</div>
              <div className="relative z-10 text-center mb-8">
                <img src={TESTIMONIALS[testimonialIndex].image} alt={TESTIMONIALS[testimonialIndex].name} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white shadow-xl" />
                <div className="flex justify-center mb-4">
                  {Array.from({ length: TESTIMONIALS[testimonialIndex].rating }).map((_, i) => (
                    <FiStar key={i} className="w-6 h-6 text-yellow-400" fill="currentColor" />
                  ))}
                </div>
                <p className="text-lg md:text-2xl text-white leading-relaxed italic mb-6">"{TESTIMONIALS[testimonialIndex].quote}"</p>
                <div>
                  <div className="font-bold text-white text-xl">{TESTIMONIALS[testimonialIndex].name}</div>
                  <div className="text-white/80">{TESTIMONIALS[testimonialIndex].role} · {TESTIMONIALS[testimonialIndex].location}</div>
                  <div className="mt-2 inline-block px-3 py-1 bg-white/20 backdrop-blur-xl rounded-full text-sm">🏢 {TESTIMONIALS[testimonialIndex].business}</div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-4">
                <button onClick={prevTestimonial} className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
                  <FiChevronLeft className="w-6 h-6" />
                </button>
                <div className="flex gap-2">
                  {TESTIMONIALS.map((_, i) => (
                    <button key={i} onClick={() => setTestimonialIndex(i)} className={`h-2 rounded-full transition-all ${i === testimonialIndex ? 'w-8 bg-white' : 'w-2 bg-white/40'}`}></button>
                  ))}
                </div>
                <button onClick={nextTestimonial} className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
                  <FiChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="section bg-white dark:bg-dark-900 relative overflow-hidden">
        <div className="container-custom">
          <div className="relative rounded-4xl bg-gradient-to-br from-primary-600 via-secondary-600 to-primary-700 p-12 md:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 bg-grid opacity-20"></div>
            <div className="relative z-10 max-w-3xl mx-auto text-white">
              <div className="text-6xl mb-6">🚀</div>
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">Ready to Start Your <span className="text-yellow-300">Success Story?</span></h2>
              <p className="text-xl text-white/90 mb-8">Join 10,000+ entrepreneurs building their dream businesses.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                <Link to="/register" className="btn-glass btn-xl text-white group">
                  Start Free Today <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/business-ideas" className="btn-outline btn-xl text-white border-white hover:bg-white/10">Explore Ideas</Link>
              </div>
              <div className="flex items-center justify-center gap-6 text-white/80 text-sm">
                <div className="flex items-center gap-1"><FiCheckCircle className="text-green-300" /><span>Free forever</span></div>
                <div className="flex items-center gap-1"><FiCheckCircle className="text-green-300" /><span>No credit card</span></div>
                <div className="flex items-center gap-1"><FiCheckCircle className="text-green-300" /><span>Setup in 2 min</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUSTED BY */}
      <section className="py-12 bg-dark-50 dark:bg-dark-800 border-y border-dark-100 dark:border-dark-700">
        <div className="container-custom">
          <p className="text-center text-sm text-dark-500 mb-8 uppercase tracking-wider font-medium">🏆 Trusted by leading organizations</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-60 hover:opacity-100 transition-opacity">
            {['SBA', 'Unified Mentor', 'Startup India', 'MSME', 'Skill India', 'DPIIT'].map((brand) => (
              <div key={brand} className="text-2xl md:text-3xl font-bold text-dark-400 hover:text-primary-600 transition-colors cursor-pointer">{brand}</div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default HomePage;