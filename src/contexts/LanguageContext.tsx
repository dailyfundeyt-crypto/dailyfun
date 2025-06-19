
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
    
    // Search Page
    'search.title': 'Search Articles',
    'search.placeholder': 'Search articles, authors, or topics...',
    'search.all': 'All Categories',
    'search.results': 'articles found',
    'search.results.for': 'for',
    'search.no.results': 'No articles found',
    'search.no.results.desc': 'Try adjusting your search terms or filters',
    
    // About Us Page
    'about.title': 'About Us',
    'about.subtitle': 'Get to know the team behind Daily Fun',
    'about.mission.title': 'Our Mission',
    'about.mission.desc': 'At Daily Fun, we believe news doesn\'t have to be boring. We\'re dedicated to bringing you reliable, entertaining content that keeps you informed while putting a smile on your face.',
    'about.team.title': 'Meet Our Team',
    'about.founder.name': 'Stefan Kunc',
    'about.founder.title': 'Founder & Editor-in-Chief',
    'about.founder.desc': 'Stefan founded Daily Fun with a vision to make news engaging and accessible to everyone.',
    'about.story.title': 'Our Story',
    'about.story.desc': 'Daily Fun was born from the idea that staying informed should be enjoyable. We combine journalistic integrity with a fresh, entertaining approach to bring you the news that matters.',
    
    // Products Page
    'products.title': 'Our Products',
    'products.subtitle': 'Discover our unique products full of humor and interesting facts.',
    'products.not.available': 'Not Yet Available',
    'products.category': 'Category:',
    'products.book': 'Book',
    'products.topic': 'Topic:',
    'products.facts': 'Facts',
    'products.pages': 'Pages:',
    'products.learn.more': 'Learn More',
    'products.coming.soon': 'Coming Soon',
    'products.coming.desc': 'We\'re working hard to soon present you with our first product. A book full of entertaining facts that brings Daily Fun directly to your home!',
    
    // Contact Page
    'contact.title': 'Contact Us',
    'contact.subtitle': 'Get in touch with us! We\'re here to help and answer any questions you might have.',
    'contact.german': 'For German Inquiries',
    'contact.english': 'For English Inquiries',
    'contact.love.to.hear': 'We\'d Love to Hear From You!',
    'contact.love.desc': 'Whether you have questions, feedback, or just want to say hello, don\'t hesitate to reach out. We typically respond within 24 hours.',
    
    // Privacy Policy Page
    'privacy.title': 'Privacy Policy',
    'privacy.no.data': 'We do not collect any personal data.',
    'privacy.desc': 'Your privacy is important to us. We are committed to protecting your personal information and maintaining transparency about our data practices.',
    
    // Terms of Service Page
    'terms.title': 'Terms of Service',
    'terms.no.data': 'We do not collect any personal data.',
    'terms.desc': 'By using our service, you agree to our commitment to your privacy. We maintain a simple approach to data handling and user experience.',
    
    // Category Page
    'category.back': 'Back to Home',
    'category.articles': 'articles in this category',
    'category.no.articles': 'No articles found',
    'category.no.articles.desc': 'There are currently no articles in the',
    'category.not.found': 'Category Not Found',
    'category.return': 'Return to Home',
    
    // Footer
    'footer.quote': 'Delivering reliable news and engaging stories to keep you informed and entertained - because life\'s too short for boring headlines.',
    'footer.rights': '© 2024 Daily Fun. All rights reserved.',
    'footer.quick': 'Quick Links',
    'footer.categories': 'Fun Categories',
    
    // Common
    'common.back': 'Back to Home',
    'common.contact': 'Contact',
    'common.privacy': 'Privacy Policy',
    'common.terms': 'Terms of Service'
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
    
    // Search Page
    'search.title': 'Artikel durchsuchen',
    'search.placeholder': 'Artikel, Autoren oder Themen suchen...',
    'search.all': 'Alle Kategorien',
    'search.results': 'Artikel gefunden',
    'search.results.for': 'für',
    'search.no.results': 'Keine Artikel gefunden',
    'search.no.results.desc': 'Versuchen Sie, Ihre Suchbegriffe oder Filter anzupassen',
    
    // About Us Page
    'about.title': 'Über Uns',
    'about.subtitle': 'Lernen Sie das Team hinter Daily Fun kennen',
    'about.mission.title': 'Unsere Mission',
    'about.mission.desc': 'Bei Daily Fun glauben wir, dass Nachrichten nicht langweilig sein müssen. Wir sind darauf spezialisiert, Ihnen zuverlässige, unterhaltsame Inhalte zu bringen, die Sie informiert halten und Ihnen ein Lächeln ins Gesicht zaubern.',
    'about.team.title': 'Unser Team',
    'about.founder.name': 'Stefan Kunc',
    'about.founder.title': 'Gründer & Chefredakteur',
    'about.founder.desc': 'Stefan gründete Daily Fun mit der Vision, Nachrichten für alle ansprechend und zugänglich zu machen.',
    'about.story.title': 'Unsere Geschichte',
    'about.story.desc': 'Daily Fun entstand aus der Idee, dass informiert bleiben Spaß machen sollte. Wir kombinieren journalistische Integrität mit einem frischen, unterhaltsamen Ansatz, um Ihnen die Nachrichten zu bringen, die wichtig sind.',
    
    // Products Page
    'products.title': 'Unsere Produkte',
    'products.subtitle': 'Entdecken Sie unsere einzigartigen Produkte voller Humor und interessanter Fakten.',
    'products.not.available': 'Noch nicht verfügbar',
    'products.category': 'Kategorie:',
    'products.book': 'Buch',
    'products.topic': 'Thema:',
    'products.facts': 'Fakten',
    'products.pages': 'Seiten:',
    'products.learn.more': 'Mehr erfahren',
    'products.coming.soon': 'Demnächst',
    'products.coming.desc': 'Wir arbeiten hart daran, Ihnen bald unser erstes Produkt zu präsentieren. Ein Buch voller unterhaltsamer Fakten, das Daily Fun direkt zu Ihnen nach Hause bringt!',
    
    // Contact Page
    'contact.title': 'Kontakt',
    'contact.subtitle': 'Kontaktieren Sie uns! Wir sind hier, um zu helfen und alle Ihre Fragen zu beantworten.',
    'contact.german': 'Für deutsche Anfragen',
    'contact.english': 'Für englische Anfragen',
    'contact.love.to.hear': 'Wir würden gerne von Ihnen hören!',
    'contact.love.desc': 'Egal ob Sie Fragen haben, Feedback geben möchten oder einfach nur hallo sagen wollen, zögern Sie nicht, uns zu kontaktieren. Wir antworten normalerweise innerhalb von 24 Stunden.',
    
    // Privacy Policy Page
    'privacy.title': 'Datenschutzrichtlinie',
    'privacy.no.data': 'Wir sammeln keine persönlichen Daten.',
    'privacy.desc': 'Ihr Datenschutz ist uns wichtig. Wir verpflichten uns, Ihre persönlichen Informationen zu schützen und Transparenz über unsere Datenpraktiken zu wahren.',
    
    // Terms of Service Page
    'terms.title': 'Nutzungsbedingungen',
    'terms.no.data': 'Wir sammeln keine persönlichen Daten.',
    'terms.desc': 'Durch die Nutzung unseres Services stimmen Sie unserem Engagement für Ihren Datenschutz zu. Wir verfolgen einen einfachen Ansatz beim Umgang mit Daten und der Benutzererfahrung.',
    
    // Category Page
    'category.back': 'Zurück zur Startseite',
    'category.articles': 'Artikel in dieser Kategorie',
    'category.no.articles': 'Keine Artikel gefunden',
    'category.no.articles.desc': 'Es gibt derzeit keine Artikel in der Kategorie',
    'category.not.found': 'Kategorie nicht gefunden',
    'category.return': 'Zur Startseite zurückkehren',
    
    // Footer
    'footer.quote': 'Zuverlässige Nachrichten und fesselnde Geschichten liefern, um Sie informiert und unterhalten zu halten - denn das Leben ist zu kurz für langweilige Schlagzeilen.',
    'footer.rights': '© 2024 Daily Fun. Alle Rechte vorbehalten.',
    'footer.quick': 'Schnelle Links',
    'footer.categories': 'Spaß Kategorien',
    
    // Common
    'common.back': 'Zurück zur Startseite',
    'common.contact': 'Kontakt',
    'common.privacy': 'Datenschutzrichtlinie',
    'common.terms': 'Nutzungsbedingungen'
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
