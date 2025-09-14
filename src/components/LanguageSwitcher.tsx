
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSwitcher = () => {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="apple-toggle inline-flex items-center px-4 py-2 bg-background/50 backdrop-blur-sm border-2 border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 ease-apple-spring rounded-xl font-medium text-sm"
      aria-label="Toggle language"
    >
      <span className="mr-1">🌐</span>
      {language === 'en' ? 'EN' : 'DE'}
    </button>
  );
};

export default LanguageSwitcher;
