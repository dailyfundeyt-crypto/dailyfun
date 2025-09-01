
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSwitcher = () => {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="inline-flex items-center px-4 py-2 bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-300 rounded-lg font-medium text-sm"
      aria-label="Toggle language"
    >
      <span className="mr-1">🌐</span>
      {language === 'en' ? 'EN' : 'DE'}
    </button>
  );
};

export default LanguageSwitcher;
