
import { useState, useCallback, useMemo } from 'react';
import { Search, Menu, X, Home, Info, ShoppingCart, Globe, Bot, Zap } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { language, toggleLanguage } = useLanguage();

  const navigation = useMemo(() => [
    { icon: Home, href: '/search', label: 'Home' },
    { icon: Info, href: '/about', label: 'About' },
    { icon: ShoppingCart, href: '/products', label: 'Products' },
    { icon: Zap, href: '/weird', label: 'Strange News' },
    { icon: Globe, href: '#', label: 'Language', action: 'language' },
    { icon: Bot, href: '/ai', label: 'AI Chat' },
  ], []);

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
            <Link to="/search" className="text-2xl font-bold text-black hover:text-red-accent transition-colors">
              Daily Fun
            </Link>
          </div>

          {/* Desktop Navigation - Icons only */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = (item.href === '/search' && (location.pathname === '/' || location.pathname === '/search')) || (item.href !== '/search' && location.pathname === item.href);
              
              if (item.action === 'language') {
                return (
                  <button
                    key={item.label}
                    onClick={() => handleNavigation(item)}
                    className={`p-2 rounded-md transition-colors ${
                      isActive
                        ? 'text-[hsl(var(--icon-hover))]'
                        : 'text-[hsl(var(--icon-default))] hover:text-[hsl(var(--icon-hover))]'
                    }`}
                    title={`${item.label} (${language === 'en' ? 'EN' : 'DE'})`}
                  >
                    <span className="text-sm font-medium">{language === 'en' ? 'EN' : 'DE'}</span>
                  </button>
                );
              }
              
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`p-2 rounded-md transition-colors ${
                    isActive
                      ? 'text-[hsl(var(--icon-hover))]'
                      : 'text-[hsl(var(--icon-default))] hover:text-[hsl(var(--icon-hover))]'
                  }`}
                  title={item.label}
                >
                  <Icon className="h-5 w-5" />
                </Link>
              );
            })}
          </nav>

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
