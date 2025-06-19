
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LanguageContextType {
  language: 'en' | 'de';
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionary - this is a placeholder mechanism
const translations = {
  en: {
    // Header
    'header.home': 'Home',
    'header.search': 'Search',
    'header.about': 'About Us',
    'header.products': 'Products',
    'header.weird': 'Weird News',
    'header.translate': 'Translate',
    
    // Homepage
    'home.welcome': 'Welcome to Daily Fun',
    'home.tagline': 'Daily Fun: Make News Fun Again. Your daily dose of trustworthy entertainment.',
    'home.latest': 'Latest Articles',
    'home.product.title': 'Our Latest Product',
    'home.product.description': 'Stay tuned for our exciting debut: a book full of entertaining facts!',
    'home.product.button': 'View Product',
    'home.goals.title': 'Our Goals',
    'home.goals.inspire': 'Inspire Millions',
    'home.goals.inspire.desc': 'Reach a vast audience with our unique blend of news.',
    'home.goals.laughter': 'Endless Laughter',
    'home.goals.laughter.desc': 'Create countless stories that bring joy and insight.',
    'home.goals.talent': 'Global Talent',
    'home.goals.talent.desc': 'Build a diverse team of comedic journalists worldwide.',
    'home.goals.fun': 'Uninterrupted Fun',
    'home.goals.fun.desc': 'Deliver entertaining and trustworthy content around the clock.',
    
    // Footer
    'footer.quote': 'Delivering reliable news and engaging stories to keep you informed and entertained - because life\'s too short for boring headlines.',
    'footer.rights': '© 2024 Daily Fun. All rights reserved.',
    'footer.quick': 'Quick Links',
    'footer.categories': 'Fun Categories',
  },
  de: {
    // Header
    'header.home': 'Startseite',
    'header.search': 'Suchen',
    'header.about': 'Über Uns',
    'header.products': 'Produkte',
    'header.weird': 'Seltsame Nachrichten',
    'header.translate': 'Übersetzen',
    
    // Homepage
    'home.welcome': 'Willkommen bei Daily Fun',
    'home.tagline': 'Daily Fun: Macht Nachrichten wieder Spaß. Ihre tägliche Dosis vertrauenswürdiger Unterhaltung.',
    'home.latest': 'Neueste Artikel',
    'home.product.title': 'Unser neuestes Produkt',
    'home.product.description': 'Bleib dran für unser spannendes Debüt: ein Buch voller unterhaltsamer Fakten!',
    'home.product.button': 'Zum Produkt',
    'home.goals.title': 'Unsere Ziele',
    'home.goals.inspire': 'Millionen Inspirieren',
    'home.goals.inspire.desc': 'Eine große Zielgruppe mit unserer einzigartigen Nachrichtenmischung erreichen.',
    'home.goals.laughter': 'Endloses Lachen',
    'home.goals.laughter.desc': 'Unzählige Geschichten schaffen, die Freude und Einsicht bringen.',
    'home.goals.talent': 'Globales Talent',
    'home.goals.talent.desc': 'Ein vielfältiges Team von komödiantischen Journalisten weltweit aufbauen.',
    'home.goals.fun': 'Ununterbrochener Spaß',
    'home.goals.fun.desc': 'Unterhaltsame und vertrauenswürdige Inhalte rund um die Uhr liefern.',
    
    // Footer
    'footer.quote': 'Zuverlässige Nachrichten und fesselnde Geschichten liefern, um Sie informiert und unterhalten zu halten - denn das Leben ist zu kurz für langweilige Schlagzeilen.',
    'footer.rights': '© 2024 Daily Fun. Alle Rechte vorbehalten.',
    'footer.quick': 'Schnelle Links',
    'footer.categories': 'Spaß Kategorien',
  }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<'en' | 'de'>('en');

  // Load saved language preference on component mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('daily-fun-language') as 'en' | 'de';
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'de')) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language preference whenever it changes
  useEffect(() => {
    localStorage.setItem('daily-fun-language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'de' : 'en');
  };

  // Translation function - returns the translated text or the key if not found
  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
