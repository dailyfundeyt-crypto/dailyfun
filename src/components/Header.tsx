
import { useState, useCallback, useMemo, useEffect } from 'react';
import { Search, Menu, X, Home, Info, Globe, Bot, User, LogIn, LogOut, MessageCircle } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoText, setLogoText] = useState('Fun');
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { setTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const { user, signOut } = useAuth();

  // Listen for logo phase changes from animation
  useEffect(() => {
    const handlePhaseChange = (event: CustomEvent) => {
      if (event.detail === 'conect') {
        setLogoText('Connect');
      } else if (event.detail === 'daily-fun') {
        setLogoText('Fun');
      } else if (event.detail === 'phase4' || event.detail === 'phase3' || event.detail === 'phase2') {
        setLogoText('Fun'); // Keep Fun during transition phases
      }
    };

    window.addEventListener('logoPhaseChange', handlePhaseChange as EventListener);
    return () => window.removeEventListener('logoPhaseChange', handlePhaseChange as EventListener);
  }, []);

  const toggleLogo = useCallback(() => {
    const newText = logoText === 'Fun' ? 'Connect' : 'Fun';
    
    // Wenn auf Connect gewechselt wird und nicht angemeldet
    if (newText === 'Connect' && !user) {
      setShowAuthDialog(true);
      return;
    }
    
    // Dark Mode aktivieren/deaktivieren basierend auf Logo
    if (newText === 'Connect') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
    
    setLogoText(newText);
  }, [logoText, user, setTheme]);

  const handleAuthConfirm = useCallback(() => {
    setShowAuthDialog(false);
    navigate('/auth');
  }, [navigate]);

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
    <>
      <AlertDialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <AlertDialogContent className="max-w-md bg-white/95 backdrop-blur-xl border-0 shadow-2xl rounded-3xl p-0 overflow-hidden">
          <div className="bg-gradient-to-br from-gray-50 to-white p-8">
            <AlertDialogHeader className="space-y-4">
              <AlertDialogTitle className="text-2xl font-semibold text-center text-gray-900 tracking-tight">
                Anmeldung erforderlich
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center text-gray-600 text-base leading-relaxed">
                Sie müssen sich anmelden, um Connect zu nutzen und alle Funktionen freizuschalten.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-col gap-2 mt-6">
              <AlertDialogAction
                onClick={handleAuthConfirm}
                className="w-full bg-black hover:bg-gray-900 text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Zur Anmeldung
              </AlertDialogAction>
              <AlertDialogCancel className="w-full mt-0 border-0 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl transition-all duration-200">
                Abbrechen
              </AlertDialogCancel>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <header className="bg-background shadow-sm border-b border-border relative z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Fun/Connect logo */}
            <div className="flex items-center">
              <button 
                onClick={toggleLogo}
                className={`text-2xl font-bold text-foreground hover:text-red-accent transition-all duration-500 cursor-pointer ${
                  logoText === 'Connect' ? 'animate-glow-text-connect' : ''
                }`}
              >
                {logoText}
              </button>
            </div>
          
          <style>{`
            @keyframes glow-text-connect {
              0%, 100% {
                text-shadow: 
                  0 0 10px rgba(0, 123, 255, 0.6),
                  0 0 20px rgba(0, 123, 255, 0.4),
                  0 0 30px rgba(0, 123, 255, 0.3);
              }
              50% {
                text-shadow: 
                  0 0 20px rgba(0, 123, 255, 0.8),
                  0 0 40px rgba(0, 123, 255, 0.6),
                  0 0 60px rgba(0, 123, 255, 0.5),
                  0 0 80px rgba(0, 123, 255, 0.4);
              }
            }
            
            .dark .animate-glow-text-connect {
              animation: glow-text-connect 2s ease-in-out infinite;
              color: rgba(255, 255, 255, 0.95);
            }
            
            .animate-glow-text-connect {
              animation: glow-text-connect 2s ease-in-out infinite;
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
                        ? 'text-foreground bg-accent shadow-md'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
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
                      ? 'active text-foreground shadow-lg bg-accent'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
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
    </>
  );
};

export default Header;
