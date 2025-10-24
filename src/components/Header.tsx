
import { useState, useCallback, useMemo, useEffect } from 'react';
import { Search, Menu, X, Home, Info, Globe, Bot, User, LogIn, LogOut, MessageCircle } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
    
    setLogoText(newText);
  }, [logoText, user]);

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
        <AlertDialogContent className="max-w-md bg-background/95 backdrop-blur-xl border shadow-2xl rounded-3xl p-0 overflow-hidden">
          <div className="bg-gradient-to-br from-muted to-background p-8">
            <AlertDialogHeader className="space-y-4">
              <AlertDialogTitle className="text-2xl font-semibold text-center text-foreground tracking-tight">
                Anmeldung erforderlich
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center text-muted-foreground text-base leading-relaxed">
                Sie müssen sich anmelden, um Connect zu nutzen und alle Funktionen freizuschalten.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-col gap-2 mt-6">
              <AlertDialogAction
                onClick={handleAuthConfirm}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Zur Anmeldung
              </AlertDialogAction>
              <AlertDialogCancel className="w-full mt-0 border-0 bg-muted hover:bg-muted/80 text-foreground font-medium py-3 rounded-xl transition-all duration-200">
                Abbrechen
              </AlertDialogCancel>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <header className="bg-background shadow-sm border-b border-border relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Fun/Connect logo */}
            <div className="flex items-center">
              <button 
                onClick={toggleLogo}
                className={`text-2xl font-bold text-foreground hover:text-red-accent transition-all duration-500 cursor-pointer ${
                  logoText === 'Connect' ? 'animate-glow-text' : ''
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
    </>
  );
};

export default Header;
