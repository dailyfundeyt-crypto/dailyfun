
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSwitcher = () => {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <div className="flex items-center space-x-3">
      <span className="text-sm text-gray-600 font-medium">
        {t('header.translate')}
      </span>
      <button
        onClick={toggleLanguage}
        className="relative inline-flex items-center w-16 h-8 bg-gray-200 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-accent focus:ring-offset-2 hover:bg-gray-300"
        aria-label="Toggle language"
      >
        {/* Switch track */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          {/* EN label */}
          <div className="absolute left-1 top-1/2 transform -translate-y-1/2 text-xs font-bold text-gray-600">
            EN
          </div>
          {/* DE label */}
          <div className="absolute right-1 top-1/2 transform -translate-y-1/2 text-xs font-bold text-gray-600">
            DE
          </div>
        </div>
        
        {/* Switch thumb */}
        <div
          className={`absolute w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 flex items-center justify-center ${
            language === 'en' ? 'transform translate-x-1' : 'transform translate-x-9'
          }`}
        >
          <span className="text-xs font-bold text-gray-800">
            {language === 'en' ? 'EN' : 'DE'}
          </span>
        </div>
      </button>
    </div>
  );
};

export default LanguageSwitcher;
