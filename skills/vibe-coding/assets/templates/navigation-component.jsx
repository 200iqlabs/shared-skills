// Navigation Header Template for Vibe Coding
// Copy and customize this template for sticky navigation

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NavigationTemplate = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Projects', href: '#projects' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-neutral-950/80 backdrop-blur-md border-b border-white/5">
      <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <a
          href="#home"
          className="text-2xl font-bold bg-gradient-to-r from-accent-neon to-accent-cyan bg-clip-text text-transparent"
        >
          Logo
        </a>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-neutral-400 hover:text-accent-neon transition-colors relative group"
            >
              {link.name}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent-neon group-hover:w-full transition-all duration-300" />
            </a>
          ))}
          <button className="px-6 py-2 bg-accent-neon text-black font-semibold rounded-lg hover:scale-105 transition-transform duration-300">
            Get Started
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-white focus:outline-hidden"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-neutral-900/95 backdrop-blur-md border-b border-white/5"
          >
            <div className="px-4 py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-neutral-400 hover:text-accent-neon transition-colors py-2"
                >
                  {link.name}
                </a>
              ))}
              <button className="px-6 py-3 bg-accent-neon text-black font-semibold rounded-lg hover:scale-105 transition-transform duration-300 w-full">
                Get Started
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default NavigationTemplate;

/*
Usage Notes:

1. Add smooth scrolling in your CSS:
   html {
     scroll-behavior: smooth;
   }

2. Update navLinks array with your actual navigation items

3. Customize colors using your design tokens:
   - Replace accent-neon with your primary accent color
   - Replace neutral-950, neutral-900, etc. with your background colors

4. For active link highlighting, use React Router or your routing solution:
   import { useLocation } from 'react-router-dom';
   const location = useLocation();
   const isActive = location.pathname === link.href;
*/
