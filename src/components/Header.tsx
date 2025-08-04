import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Home, Search, User, Phone, MessageSquare, Languages, Info, ShoppingCart, Globe, Bot, Zap } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useScrollDetection } from '../hooks/useScrollDetection';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const navigation = [
  { icon: Home, href: '/', label: 'Home' },
  { icon: Search, href: '/search', label: 'Search' },
  { icon: Info, href: '/about', label: 'About' },
  { icon: ShoppingCart, href: '/products', label: 'Products' },
  { icon: Zap, href: '/weird', label: 'Strange News' },
  { icon: Globe, href: '#', label: 'Language', action: () => null },
  { icon: Bot, href: '/ai', label: 'AI Chat' },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toggleLanguage } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const isScrolled = useScrollDetection(50);

  const handleNavigation = (action?: () => void) => {
    setIsMenuOpen(false);
    if (action) {
      action();
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-background/80 backdrop-blur-xl shadow-elevation-2 animate-slide-in-blur' 
        : 'bg-background shadow-elevation-1'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <h1 className="text-2xl font-signature font-bold text-red-accent transition-transform duration-300 group-hover:scale-105">
              Daily Fun
            </h1>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Artikel suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 w-full font-sans shadow-elevation-1 border-0 bg-muted/50 focus:bg-background transition-all duration-300"
                />
              </div>
            </form>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {navigation.map((item) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <div key={item.href} className="relative group">
                  {item.action ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleLanguage()}
                      className={`flex items-center font-display transition-all duration-300 hover:scale-105 ${
                        isActive 
                          ? 'text-red-accent bg-red-accent/10' 
                          : 'text-foreground hover:text-red-accent hover:bg-red-accent/5'
                      }`}
                    >
                      <IconComponent size={18} />
                    </Button>
                  ) : (
                    <Link to={item.href}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`flex items-center font-display transition-all duration-300 hover:scale-105 ${
                          isActive 
                            ? 'text-red-accent bg-red-accent/10' 
                            : 'text-foreground hover:text-red-accent hover:bg-red-accent/5'
                        }`}
                      >
                        <IconComponent size={18} />
                      </Button>
                    </Link>
                  )}
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-red-accent rounded-full" />
                  )}
                </div>
              );
            })}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-foreground hover:text-red-accent transition-colors duration-300"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden animate-fade-in-up">
          <div className="px-4 pt-4 pb-6 space-y-3 bg-background/95 backdrop-blur-xl border-t border-border">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Artikel suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 w-full font-sans"
                />
              </div>
            </form>

            {navigation.map((item) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <div key={item.href}>
                  {item.action ? (
                    <Button
                      variant="ghost"
                      onClick={() => handleNavigation(toggleLanguage)}
                      className={`w-full justify-start text-left font-display text-base transition-all duration-300 ${
                        isActive
                          ? 'text-red-accent bg-red-accent/10'
                          : 'text-foreground hover:text-red-accent hover:bg-red-accent/5'
                      }`}
                    >
                      <IconComponent size={20} className="mr-3" />
                      <span>{item.label}</span>
                    </Button>
                  ) : (
                    <Link to={item.href} onClick={() => handleNavigation()}>
                      <Button
                        variant="ghost"
                        className={`w-full justify-start text-left font-display text-base transition-all duration-300 ${
                          isActive
                            ? 'text-red-accent bg-red-accent/10'
                            : 'text-foreground hover:text-red-accent hover:bg-red-accent/5'
                        }`}
                      >
                        <IconComponent size={20} className="mr-3" />
                        <span>{item.label}</span>
                      </Button>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;