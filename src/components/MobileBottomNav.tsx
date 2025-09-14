import { Home, Bot, Zap, Info, Globe } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const MobileBottomNav = () => {
  const location = useLocation();
  const { language, toggleLanguage } = useLanguage();

  const navigation = [
    { icon: Home, href: '/search', label: 'Home' },
    { icon: Bot, href: '/ai', label: 'AI Chat' },
    { icon: Zap, href: '/weird', label: 'Strange News' },
    { icon: Info, href: '/about', label: 'About' },
    { icon: Globe, href: '#', label: language === 'en' ? 'EN' : 'DE', action: 'language' },
  ];

  const handleHomeClick = () => {
    // If already on home page, scroll to top
    if (location.pathname === '/search' || location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isActive = (href: string) => {
    if (href === '/search') {
      return location.pathname === '/' || location.pathname === '/search';
    }
    return location.pathname === href;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-border shadow-2xl md:hidden">
      <div className="flex justify-center items-center py-4 px-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          if (item.action === 'language') {
            return (
              <button
                key={item.label}
                onClick={toggleLanguage}
                className={`apple-toggle flex items-center justify-center min-w-[48px] h-12 mx-1 rounded-2xl backdrop-blur-sm transition-all duration-300 ease-apple-spring ${
                  active
                    ? 'text-primary bg-primary/10 scale-110 shadow-lg shadow-primary/20'
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/5 hover:shadow-md'
                }`}
              >
                <span className="text-xs font-bold tracking-wider px-1">
                  {language === 'en' ? 'EN' : 'DE'}
                </span>
              </button>
            );
          }
          
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={item.href === '/search' ? handleHomeClick : undefined}
              className={`apple-nav-item flex items-center justify-center w-12 h-12 mx-1 rounded-2xl backdrop-blur-sm transition-all duration-300 ease-apple-spring ${
                active
                  ? 'active text-primary bg-primary/10 scale-110 shadow-lg shadow-primary/20'
                  : 'text-muted-foreground hover:text-primary hover:bg-primary/5 hover:shadow-md'
              }`}
            >
              <Icon className="h-5 w-5" />
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;