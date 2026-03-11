'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export default function Nav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();

    // Check current session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setAuthLoaded(true);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = '/';
  };

  return (
    <nav className={`nav ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-inner">
        <a href="/" className="logo">
          <span className="logo-light">Thorough</span>
          <span className="logo-bold">Byte</span>
        </a>
        <div className={`nav-links ${isMobileMenuOpen ? 'open' : ''}`}>
          <a href="/#what-we-do" onClick={closeMobileMenu}>What We Do</a>
          <a href="/#performance" onClick={closeMobileMenu}>Performance</a>
          <a href="/#alpha" onClick={closeMobileMenu}>Alpha</a>
          <a href="/#product" onClick={closeMobileMenu}>Product</a>

          {authLoaded && user ? (
            <>
              <a href="/dashboard" onClick={closeMobileMenu} className="nav-cta">Dashboard</a>
            </>
          ) : (
            <>
              <a href="/auth/signin" onClick={closeMobileMenu}>Sign In</a>
              <a href="/auth/signup" className="nav-cta" onClick={closeMobileMenu}>Sign Up Free</a>
            </>
          )}
        </div>
        <button
          className="mobile-toggle"
          aria-label="Menu"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
}
