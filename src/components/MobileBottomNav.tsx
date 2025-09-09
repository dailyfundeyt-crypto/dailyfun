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
    { icon: Globe, href: '#', label: language === 'en' ? 'DE' : 'EN', action: 'language' },
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg md:hidden">
      <div className="flex justify-center items-center py-3">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          if (item.action === 'language') {
            return (
              <button
                key={item.label}
                onClick={toggleLanguage}
                className={`flex items-center justify-center w-12 h-12 mx-2 rounded-lg transition-colors ${
                  active
                    ? 'text-[hsl(var(--icon-hover))] bg-gray-100'
                    : 'text-[hsl(var(--icon-default))] hover:text-[hsl(var(--icon-hover))]'
                }`}
              >
                <span className="text-sm font-semibold">
                  {language === 'en' ? 'DE' : 'EN'}
                </span>
              </button>
            );
          }
          
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={item.href === '/search' ? handleHomeClick : undefined}
              className={`flex items-center justify-center w-12 h-12 mx-2 rounded-lg transition-colors ${
                active
                  ? 'text-[hsl(var(--icon-hover))] bg-gray-100'
                  : 'text-[hsl(var(--icon-default))] hover:text-[hsl(var(--icon-hover))]'
              }`}
            >
              <Icon className="h-6 w-6" />
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;