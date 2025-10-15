
import { useState, useCallback, useMemo, useEffect } from 'react';
import { Search, Menu, X, Home, Info, Globe, Bot, User, LogIn, LogOut, MessageCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoText, setLogoText] = useState('Daily Fun');
  const location = useLocation();
  const { language, toggleLanguage } = useLanguage();
  const { user, signOut } = useAuth();

  // Listen for logo phase changes from animation
  useEffect(() => {
    const handlePhaseChange = (event: CustomEvent) => {
      if (event.detail === 'conect') {
        setLogoText('Conect');
      } else if (event.detail === 'daily-fun') {
        setLogoText('Daily Fun');
      } else if (event.detail === 'phase4' || event.detail === 'phase3' || event.detail === 'phase2') {
        setLogoText('Daily Fun'); // Keep Daily Fun during transition phases
      }
    };

    window.addEventListener('logoPhaseChange', handlePhaseChange as EventListener);
    return () => window.removeEventListener('logoPhaseChange', handlePhaseChange as EventListener);
  }, []);

  const toggleLogo = useCallback(() => {
    if (user) {
      setLogoText(prev => prev === 'Daily Fun' ? 'Daily Connect' : 'Daily Fun');
    }
  }, [user]);

  const navigation = useMemo(() => [
    { icon: Home, href: '/search', label: 'Home' },
    { icon: Bot, href: '/ai', label: 'AI Chat' },
    { icon: User, href: '/weird', label: 'My Page' },
    { icon: user ? MessageCircle : Info, href: '/about', label: user ? 'Messages' : 'About' },
    { icon: Globe, href: '#', label: 'Language', action: 'language' },
  ], [user]);

  const handleNavigation = useCallback((item: typeof navigation[0]) => {
    if (item.action === 'language') {
      toggleLanguage();
    }
  }, [toggleLanguage]);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Daily Fun logo */}
          <div className="flex items-center">
            <button 
              onClick={toggleLogo}
              className={`text-2xl font-bold text-black hover:text-red-accent transition-all duration-500 cursor-pointer ${
                logoText === 'Conect' ? 'animate-glow-text' : ''
              }`}
            >
              {logoText}
            </button>
          </div>
          
          <style>{`
            @keyframes glow-text {
              0%, 100% {
                text-shadow: 0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(220, 220, 220, 0.6);
              }
              50% {
                text-shadow: 0 0 20px rgba(255, 255, 255, 1), 0 0 40px rgba(220, 220, 220, 1), 0 0 60px rgba(255, 255, 255, 0.8);
              }
            }
            
            .animate-glow-text {
              animation: glow-text 2s ease-in-out infinite;
            }
          `}</style>

          {/* Desktop Navigation - Right side */}
          <div className="hidden md:flex items-center space-x-6 ml-auto">
            <nav className="flex items-center space-x-6">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = (item.href === '/search' && (location.pathname === '/' || location.pathname === '/search')) || (item.href !== '/search' && location.pathname === item.href);
              
              if (item.action === 'language') {
                return (
                  <button
                    key={item.label}
                    onClick={() => handleNavigation(item)}
                    className={`apple-language-badge px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-all duration-300 ease-apple-spring ${
                      isActive
                        ? 'text-primary bg-primary/10 shadow-md'
                        : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                    }`}
                    title={`${item.label} (${language === 'en' ? 'EN' : 'DE'})`}
                  >
                    {language === 'en' ? 'EN' : 'DE'}
                  </button>
                );
              }
              
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`apple-nav-item p-2.5 transition-all duration-300 ease-apple ${
                    isActive
                      ? 'active text-primary shadow-lg'
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                  title={item.label}
                >
                  <Icon className="h-5 w-5" />
                </Link>
              );
            })}
            </nav>

            {/* Auth section removed - moved to My Page */}
          </div>

          {/* No mobile menu needed - using bottom nav */}
          <div className="md:hidden">
            {/* Empty div to maintain layout */}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
