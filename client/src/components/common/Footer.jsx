// ============================================
// EntreSkillHub - KHATARNAK Footer
// Full-featured with newsletter, social links
// ============================================

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiFacebook, FiTwitter, FiInstagram, FiLinkedin, FiYoutube,
  FiMail, FiPhone, FiMapPin, FiArrowRight, FiHeart,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');

    setLoading(true);
    setTimeout(() => {
      toast.success('🎉 Successfully subscribed to newsletter!');
      setEmail('');
      setLoading(false);
    }, 1000);
  };

  const currentYear = new Date().getFullYear();

  const platformLinks = [
    { label: 'Business Ideas', to: '/business-ideas' },
    { label: 'Roadmaps', to: '/roadmaps' },
    { label: 'Learning Resources', to: '/resources' },
    { label: 'Find Mentors', to: '/mentors' },
    { label: 'Success Stories', to: '/success-stories' },
    { label: 'Blog', to: '/blog' },
  ];

  const companyLinks = [
    { label: 'About Us', to: '/about' },
    { label: 'Our Team', to: '/team' },
    { label: 'Careers', to: '/careers' },
    { label: 'Press Kit', to: '/press' },
    { label: 'Partnerships', to: '/partnerships' },
    { label: 'Contact', to: '/contact' },
  ];

  const supportLinks = [
    { label: 'Help Center', to: '/help' },
    { label: 'FAQs', to: '/faqs' },
    { label: 'Community', to: '/community' },
    { label: 'Report Issue', to: '/report' },
    { label: 'Feature Request', to: '/feedback' },
    { label: 'API Docs', to: '/api-docs' },
  ];

  const legalLinks = [
    { label: 'Privacy Policy', to: '/privacy' },
    { label: 'Terms of Service', to: '/terms' },
    { label: 'Cookie Policy', to: '/cookies' },
    { label: 'GDPR', to: '/gdpr' },
    { label: 'Refund Policy', to: '/refunds' },
    { label: 'Disclaimer', to: '/disclaimer' },
  ];

  const socialLinks = [
    { icon: FiFacebook, href: 'https://facebook.com/entreskillhub', label: 'Facebook', color: 'hover:bg-blue-600' },
    { icon: FiTwitter, href: 'https://twitter.com/entreskillhub', label: 'Twitter', color: 'hover:bg-sky-500' },
    { icon: FiInstagram, href: 'https://instagram.com/entreskillhub', label: 'Instagram', color: 'hover:bg-pink-600' },
    { icon: FiLinkedin, href: 'https://linkedin.com/company/entreskillhub', label: 'LinkedIn', color: 'hover:bg-blue-700' },
    { icon: FiYoutube, href: 'https://youtube.com/@entreskillhub', label: 'YouTube', color: 'hover:bg-red-600' },
  ];

  return (
    <footer className="relative bg-dark-900 text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Newsletter Section */}
      <div className="relative border-b border-white/10">
        <div className="container-custom py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Stay in the <span className="gradient-text">Loop</span>
            </h2>
            <p className="text-dark-300 text-lg mb-8 max-w-2xl mx-auto">
              Get weekly business tips, success stories, and exclusive resources delivered right to your inbox.
            </p>

            <form onSubmit={handleSubscribe} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-white/10 backdrop-blur-xl text-white placeholder:text-dark-400 rounded-xl border border-white/20 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/50 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary btn-lg whitespace-nowrap disabled:opacity-70"
                >
                  {loading ? 'Subscribing...' : (
                    <>
                      Subscribe
                      <FiArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-dark-400 mt-4">
                🔒 We respect your privacy. Unsubscribe anytime. No spam, ever.
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="relative container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-2xl">
                🚀
              </div>
              <span className="text-2xl font-bold gradient-text">EntreSkillHub</span>
            </Link>

            <p className="text-dark-300 mb-6 leading-relaxed">
              Transforming skills into successful businesses. Join thousands of entrepreneurs on their journey to financial freedom.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <a href="mailto:hello@entreskillhub.com" className="flex items-center gap-3 text-dark-300 hover:text-primary-400 transition-colors group">
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-primary-500/20 transition-colors">
                  <FiMail className="w-4 h-4" />
                </div>
                <span className="text-sm">hello@entreskillhub.com</span>
              </a>
              <a href="tel:+911234567890" className="flex items-center gap-3 text-dark-300 hover:text-primary-400 transition-colors group">
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-primary-500/20 transition-colors">
                  <FiPhone className="w-4 h-4" />
                </div>
                <span className="text-sm">+91 123 456 7890</span>
              </a>
              <div className="flex items-start gap-3 text-dark-300">
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <FiMapPin className="w-4 h-4" />
                </div>
                <span className="text-sm">Mumbai, Maharashtra<br />India - 400001</span>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <p className="text-sm font-semibold mb-3 text-white">Follow Us</p>
              <div className="flex items-center gap-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-dark-300 hover:text-white transition-all hover:scale-110 ${social.color}`}
                    aria-label={social.label}
                  >
                    <social.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-white">
              Platform
            </h3>
            <ul className="space-y-3">
              {platformLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-dark-300 hover:text-primary-400 text-sm transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-0 h-0.5 bg-primary-500 group-hover:w-3 transition-all"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-white">
              Company
            </h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-dark-300 hover:text-primary-400 text-sm transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-0 h-0.5 bg-primary-500 group-hover:w-3 transition-all"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-white">
              Support
            </h3>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-dark-300 hover:text-primary-400 text-sm transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-0 h-0.5 bg-primary-500 group-hover:w-3 transition-all"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-white">
              Legal
            </h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-dark-300 hover:text-primary-400 text-sm transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-0 h-0.5 bg-primary-500 group-hover:w-3 transition-all"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* App Download Banner */}
        <div className="mt-16 p-8 rounded-3xl bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border border-white/10 backdrop-blur-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold mb-2">📱 Coming Soon: Mobile App</h3>
              <p className="text-dark-300">Get EntreSkillHub in your pocket. Available on iOS and Android soon!</p>
            </div>
            <div className="flex gap-3">
              <button className="px-6 py-3 bg-black rounded-xl border border-white/20 hover:bg-white/10 transition-all">
                🍎 App Store
              </button>
              <button className="px-6 py-3 bg-black rounded-xl border border-white/20 hover:bg-white/10 transition-all">
                🤖 Play Store
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative border-t border-white/10 py-6">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-dark-400 text-center md:text-left">
              &copy; {currentYear} <span className="gradient-text font-semibold">EntreSkillHub</span>. All rights reserved.
            </p>

            <div className="flex items-center gap-2 text-sm text-dark-400">
              <span>Made with</span>
              <FiHeart className="w-4 h-4 text-red-500 animate-pulse" fill="currentColor" />
              <span>in India for Entrepreneurs Worldwide</span>
            </div>

            <div className="flex items-center gap-4 text-xs text-dark-500">
              <span>🌍 Available in 10+ languages</span>
              <span>·</span>
              <span>🔒 SOC 2 Certified</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;