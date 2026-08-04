// ============================================
// EntreSkillHub - Main Layout
// Wraps pages with Navbar and Footer
// ============================================

import React from 'react';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';

const MainLayout = ({ children, showNavbar = true, showFooter = true }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {showNavbar && <Navbar />}
      <main className="flex-1">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
};

export default MainLayout;