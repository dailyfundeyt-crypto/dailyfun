import { Home, Bot, Zap, Info, Globe } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useIsMobile } from '../hooks/use-mobile';

const MobileBottomNav = () => {
  const location = useLocation();
  const { language, toggleLanguage } = useLanguage();
  const isMobile = useIsMobile();

  // Only show on mobile devices
  if (!isMobile) return null;

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
      <div className="flex justify-around items-center py-2 px-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          if (item.action === 'language') {
            return (
              <button
                key={item.label}
                onClick={toggleLanguage}
                className={`flex flex-col items-center p-2 rounded-lg transition-colors min-w-0 ${
                  active
                    ? 'text-[hsl(var(--icon-hover))] bg-gray-100'
                    : 'text-[hsl(var(--icon-default))] hover:text-[hsl(var(--icon-hover))]'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </button>
            );
          }
          
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={item.href === '/search' ? handleHomeClick : undefined}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors min-w-0 ${
                active
                  ? 'text-[hsl(var(--icon-hover))] bg-gray-100'
                  : 'text-[hsl(var(--icon-default))] hover:text-[hsl(var(--icon-hover))]'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;