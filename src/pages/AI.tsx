import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, ArrowLeft, ThumbsUp, ThumbsDown, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { articles } from '@/data/articles';
import Header from '@/components/Header';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  feedback?: 'positive' | 'negative' | null;
}

// Create enhanced article database with sources and detailed info
const createArticleDatabase = () => {
  const database: { [key: string]: { sources: string[], detailedInfo: string } } = {};
  
  articles.forEach(article => {
    database[article.title] = {
      sources: [
        `${article.author} - ${new Date(article.publishedAt).toLocaleDateString()}`,
        `Daily Fun ${article.category} Section`,
        `Article Views: ${article.views.toLocaleString()}`
      ],
      detailedInfo: `${article.excerpt} This article has been viewed ${article.views.toLocaleString()} times and belongs to our ${article.category} category. Published by ${article.author}, it represents the quality journalism that Daily Fun is known for.`
    };
  });
  
  return database;
};

// Company and team information database
const createCompanyDatabase = () => {
  return {
    contact: {
      german: 'dailyfunde.kontakt@gmail.com',
      english: 'dailyfunen.contact@gmail.com'
    },
    company: {
      name: 'Daily Fun',
      mission: 'Your daily dose of trustworthy entertainment and absurd insights, proving that staying informed can actually be a blast!',
      vision: 'Daily Fun steps in to change the overwhelming nature of news. We master the balance between serious reporting and genuine entertainment value.',
      values: ['Trust', 'Humor', 'Innovation', 'Curiosity', 'Never boring']
    },
    founder: {
      name: 'Stefan Kunc',
      role: 'Founder & Vision Leader',
      vision: 'I launched Daily Fun because I firmly believe that information doesn\'t have to be dry and tedious. My goal was to create a platform that masters the balance between serious reporting and genuine entertainment value – with a passionate and dedicated team.'
    },
    team: [
      {
        name: 'Dr. Elke Schneider',
        role: 'Head of Humour & Creativity',
        type: 'AI',
        description: 'Elke is our master of good vibes. With her sharp mind and unparalleled wit, she ensures that every article and every video has that typical Daily Fun charm.'
      },
      {
        name: 'Mr. Karl Bergmann', 
        role: 'Lead Story Weaver',
        type: 'AI',
        description: 'Karl is our fact-checker and storyteller all in one. He dives deep into subjects, packaging even complex topics into understandable, captivating, and often astonishing narratives.'
      },
      {
        name: 'Mr. Jonas Richter',
        role: 'Content Alchemist', 
        type: 'AI',
        description: 'Jonas transforms ideas into visual magic. Whether it\'s designing our videos or preparing infographics – he makes sure our content is not only funny but also visually impressive.'
      }
    ]
  };
};

const AI = () => {
  const { language, t } = useLanguage();
  const articleDatabase = createArticleDatabase();
  const companyDatabase = createCompanyDatabase();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchMode, setSearchMode] = useState<'local' | 'internet'>('local');
  const [lastAIResponse, setLastAIResponse] = useState<string>('');
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Check for article parameter in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const articleParam = urlParams.get('article');
    
    if (articleParam && articleParam.length <= 500 && !/[<>"'&]/.test(articleParam)) {
      const decodedArticle = decodeURIComponent(articleParam).trim();
      const aiQuestion = language === 'de' 
        ? `Erzähl mir mehr über ${decodedArticle}`
        : `Tell me more about ${decodedArticle}`;
      setInputValue(aiQuestion);
      
      // Clear the URL parameter
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [language]);

  // Initialize welcome message based on language
  useEffect(() => {
    const welcomeMessage = {
      id: '1',
      text: language === 'de' 
        ? 'Hallo! Ich bin Daily Fun AI. Ich kann Ihnen bei Kontaktinformationen, Team-Details, Firmen-Informationen und Artikeln helfen. Fragen Sie mich zum Beispiel: "Wer ist Stefan Kunc?" oder "Wie kann ich euch kontaktieren?"'
        : 'Hello! I\'m Daily Fun AI. I can help you with contact information, team details, company information and articles. Try asking me: "Who is Stefan Kunc?" or "How can I contact you?"',
      isUser: false,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [language]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const detectLanguage = (text: string): 'de' | 'en' => {
    const germanWords = ['der', 'die', 'das', 'und', 'ist', 'ein', 'eine', 'ich', 'sie', 'er', 'wir', 'für', 'auf', 'mit', 'von', 'zu', 'am', 'im', 'über', 'dass', 'können', 'haben', 'werden', 'sein', 'nicht'];
    const englishWords = ['the', 'and', 'is', 'a', 'an', 'i', 'you', 'he', 'she', 'we', 'for', 'on', 'with', 'from', 'to', 'at', 'in', 'about', 'that', 'can', 'have', 'will', 'be', 'not'];
    
    const words = text.toLowerCase().split(/\s+/);
    let germanScore = 0;
    let englishScore = 0;
    
    words.forEach(word => {
      if (germanWords.includes(word)) germanScore++;
      if (englishWords.includes(word)) englishScore++;
    });
    
    return germanScore > englishScore ? 'de' : 'en';
  };

  const translateResponse = (response: string, targetLanguage: 'de' | 'en'): string => {
    // Simple translation logic for common response patterns
    if (targetLanguage === 'en') {
      let translatedResponse = response
        .replace(/Hier sind unsere Kontaktinformationen:/g, 'Here is our contact information:')
        .replace(/Für deutsche Anfragen:/g, 'For German inquiries:')
        .replace(/Für englische Anfragen:/g, 'For English inquiries:')
        .replace(/Wir freuen uns auf Ihre Nachricht!/g, 'We look forward to hearing from you!')
        .replace(/Hier sind alle verfügbaren Artikel:/g, 'Here are all available articles:')
        .replace(/Sie können nach Quellen oder mehr Informationen zu jedem dieser Artikel fragen!/g, 'You can ask for sources or more information about any of these articles!')
        .replace(/Hier sind die Quellen für/g, 'Here are the sources for')
        .replace(/Hier sind detailliertere Informationen über/g, 'Here\'s more detailed information about')
        .replace(/Über Daily Fun:/g, 'About Daily Fun:')
        .replace(/Unsere Werte:/g, 'Our Values:')
        .replace(/Unser Daily Fun Team:/g, 'Our Daily Fun Team:')
        .replace(/Daily Fun Mission:/g, 'Daily Fun Mission:')
        .replace(/Gründer & Visionär von Daily Fun:/g, 'Founder & Visionary of Daily Fun:')
        .replace(/ist der kreative Kopf hinter Daily Fun und hat die Plattform mit dem Ziel gegründet, Nachrichten unterhaltsam und vertrauenswürdig zu gestalten./g, 'is the creative mind behind Daily Fun and founded the platform with the goal of making news entertaining and trustworthy.')
        .replace(/Jedes Teammitglied trägt mit einzigartigen Fähigkeiten dazu bei, Daily Fun zu der vertrauenswürdigen und unterhaltsamen Plattform zu machen, die sie heute ist!/g, 'Each team member contributes unique skills to make Daily Fun the trustworthy and entertaining platform it is today!')
        .replace(/Ich kann Ihnen helfen mit:/g, 'I can help you with:')
        .replace(/Kontaktinformationen/g, 'Contact information')
        .replace(/Team-Informationen/g, 'Team information')
        .replace(/Artikel-Quellen und Details/g, 'Article sources and details')
        .replace(/Liste aller Artikel/g, 'List of all articles')
        .replace(/Fragen Sie mich zum Beispiel:/g, 'Try asking:');

      // Translate German article titles to English
      articles.forEach(article => {
        const germanTitle = t(`article.${article.id}.title`);
        translatedResponse = translatedResponse.replace(new RegExp(germanTitle, 'g'), article.title);
      });

      return translatedResponse;
    } else {
      let translatedResponse = response
        .replace(/Here is our contact information:/g, 'Hier sind unsere Kontaktinformationen:')
        .replace(/For German inquiries:/g, 'Für deutsche Anfragen:')
        .replace(/For English inquiries:/g, 'Für englische Anfragen:')
        .replace(/We look forward to hearing from you!/g, 'Wir freuen uns auf Ihre Nachricht!')
        .replace(/Here are all available articles:/g, 'Hier sind alle verfügbaren Artikel:')
        .replace(/You can ask for sources or more information about any of these articles!/g, 'Sie können nach Quellen oder mehr Informationen zu jedem dieser Artikel fragen!')
        .replace(/Here are the sources for/g, 'Hier sind die Quellen für')
        .replace(/Here\'s more detailed information about/g, 'Hier sind detailliertere Informationen über')
        .replace(/About Daily Fun:/g, 'Über Daily Fun:')
        .replace(/Our Values:/g, 'Unsere Werte:')
        .replace(/Our Daily Fun Team:/g, 'Unser Daily Fun Team:')
        .replace(/Daily Fun Mission:/g, 'Daily Fun Mission:')
        .replace(/Founder & Visionary of Daily Fun:/g, 'Gründer & Visionär von Daily Fun:')
        .replace(/is the creative mind behind Daily Fun and founded the platform with the goal of making news entertaining and trustworthy./g, 'ist der kreative Kopf hinter Daily Fun und hat die Plattform mit dem Ziel gegründet, Nachrichten unterhaltsam und vertrauenswürdig zu gestalten.')
        .replace(/Each team member contributes unique skills to make Daily Fun the trustworthy and entertaining platform it is today!/g, 'Jedes Teammitglied trägt mit einzigartigen Fähigkeiten dazu bei, Daily Fun zu der vertrauenswürdigen und unterhaltsamen Plattform zu machen, die sie heute ist!')
        .replace(/I can help you with:/g, 'Ich kann Ihnen helfen mit:')
        .replace(/Contact information/g, 'Kontaktinformationen')
        .replace(/Team information/g, 'Team-Informationen')
        .replace(/Article sources and details/g, 'Artikel-Quellen und Details')
        .replace(/List of all articles/g, 'Liste aller Artikel')
        .replace(/Try asking:/g, 'Fragen Sie mich zum Beispiel:');

      // Translate English article titles to German
      articles.forEach(article => {
        const germanTitle = t(`article.${article.id}.title`);
        translatedResponse = translatedResponse.replace(new RegExp(article.title, 'g'), germanTitle);
      });

      return translatedResponse;
    }
  };

  const processAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    const detectedLanguage = detectLanguage(userInput);
    
    // Check if user is requesting translation of the last response
    const simpleLanguageSwitchPatterns = [
      /^(auf\s+)?deutsch(\s+bitte)?$/i,
      /^(auf\s+)?englisch(\s+bitte)?$/i,
      /^(in\s+)?english(\s+please)?$/i,
      /^(in\s+)?englsh$/i, // Common misspelling
      /^(in\s+)?german(\s+please)?$/i,
      /^deutsch$/i,
      /^englisch$/i,
      /^english$/i,
      /^englsh$/i,
      /^german$/i
    ];
    
    const isTranslationRequest = lastAIResponse && 
      simpleLanguageSwitchPatterns.some(pattern => pattern.test(userInput.trim()));
    
    if (isTranslationRequest && lastAIResponse) {
      return translateResponse(lastAIResponse, detectedLanguage);
    }
    
    // Check for contact information requests
    if (input.includes('contact') || input.includes('email') || input.includes('kontakt') || input.includes('mail')) {
      if (language === 'de') {
        return `Hier sind unsere Kontaktinformationen:\n\n📧 Für deutsche Anfragen: ${companyDatabase.contact.german}\n📧 Für englische Anfragen: ${companyDatabase.contact.english}\n\nWir freuen uns auf Ihre Nachricht!`;
      } else {
        return `Here is our contact information:\n\n📧 For German inquiries: ${companyDatabase.contact.german}\n📧 For English inquiries: ${companyDatabase.contact.english}\n\nWe look forward to hearing from you!`;
      }
    }
    
    // Check for team information requests
    if (input.includes('team') || input.includes('staff') || input.includes('who') || input.includes('wer') || input.includes('mitarbeiter')) {
      if (input.includes('stefan') || input.includes('kunc')) {
        if (language === 'de') {
          return `Stefan Kunc - Gründer & Visionär von Daily Fun:\n\n"${companyDatabase.founder.vision}"\n\nStefan ist der kreative Kopf hinter Daily Fun und hat die Plattform mit dem Ziel gegründet, Nachrichten unterhaltsam und vertrauenswürdig zu gestalten.`;
        } else {
          return `Stefan Kunc - Founder & Visionary of Daily Fun:\n\n"${companyDatabase.founder.vision}"\n\nStefan is the creative mind behind Daily Fun and founded the platform with the goal of making news entertaining and trustworthy.`;
        }
      }
      
      if (input.includes('elke') || input.includes('schneider')) {
        const elke = companyDatabase.team[0];
        if (language === 'de') {
          return `${elke.name} (${elke.type}) - ${elke.role}:\n\n${elke.description}`;
        } else {
          return `${elke.name} (${elke.type}) - ${elke.role}:\n\n${elke.description}`;
        }
      }
      
      if (input.includes('karl') || input.includes('bergmann')) {
        const karl = companyDatabase.team[1];
        if (language === 'de') {
          return `${karl.name} (${karl.type}) - ${karl.role}:\n\n${karl.description}`;
        } else {
          return `${karl.name} (${karl.type}) - ${karl.role}:\n\n${karl.description}`;
        }
      }
      
      if (input.includes('jonas') || input.includes('richter')) {
        const jonas = companyDatabase.team[2];
        if (language === 'de') {
          return `${jonas.name} (${jonas.type}) - ${jonas.role}:\n\n${jonas.description}`;
        } else {
          return `${jonas.name} (${jonas.type}) - ${jonas.role}:\n\n${jonas.description}`;
        }
      }
      
      // General team overview
      const teamList = companyDatabase.team.map((member, index) => 
        `${index + 1}. ${member.name} (${member.type}) - ${member.role}`
      ).join('\n');
      
      if (language === 'de') {
        return `Unser Daily Fun Team:\n\n🧑‍💼 Stefan Kunc - Gründer & Visionär\n\n${teamList}\n\nJedes Teammitglied trägt mit einzigartigen Fähigkeiten dazu bei, Daily Fun zu der vertrauenswürdigen und unterhaltsamen Plattform zu machen, die sie heute ist!`;
      } else {
        return `Our Daily Fun Team:\n\n🧑‍💼 Stefan Kunc - Founder & Visionary\n\n${teamList}\n\nEach team member contributes unique skills to make Daily Fun the trustworthy and entertaining platform it is today!`;
      }
    }
    
    // Check for company information requests (but not if it's about a specific article)
    if ((input.includes('about') || input.includes('company') || input.includes('mission') || input.includes('vision') || 
        input.includes('über daily fun') || input.includes('unternehmen') || input.includes('werte') || input.includes('values')) &&
        !input.includes('wettervorhersage') && !input.includes('weather forecast')) {
      
      if (input.includes('mission') || input.includes('what is daily fun')) {
        if (language === 'de') {
          return `Daily Fun Mission:\n\n${companyDatabase.company.mission}\n\nWir sind Ihre tägliche Dosis vertrauensvoller Unterhaltung und absurder Einblicke, die beweist, dass informiert bleiben tatsächlich ein Vergnügen sein kann!`;
        } else {
          return `Daily Fun Mission:\n\n${companyDatabase.company.mission}\n\nWe are your daily dose of trustworthy entertainment and absurd insights, proving that staying informed can actually be a blast!`;
        }
      }
      
      if (input.includes('values') || input.includes('werte')) {
        const values = companyDatabase.company.values.join(', ');
        if (language === 'de') {
          return `Unsere Werte bei Daily Fun:\n\n🎯 ${values}\n\nBei Daily Fun stehen Vertrauen, Humor und Innovation im Mittelpunkt von allem, was wir tun. Wir liefern Fakten, die genau sind, aber auf eine Weise, die Freude bringt!`;
        } else {
          return `Our Values at Daily Fun:\n\n🎯 ${values}\n\nAt Daily Fun, trust, humor, and innovation are at the core of everything we do. We deliver facts that are accurate, but in a way that brings joy!`;
        }
      }
      
      if (language === 'de') {
        return `Über Daily Fun:\n\n${companyDatabase.company.mission}\n\n${companyDatabase.company.vision}\n\nUnsere Werte: ${companyDatabase.company.values.join(', ')}\n\nDaily Fun wurde von Stefan Kunc gegründet, um zu beweisen, dass Nachrichten nicht langweilig sein müssen!`;
      } else {
        return `About Daily Fun:\n\n${companyDatabase.company.mission}\n\n${companyDatabase.company.vision}\n\nOur Values: ${companyDatabase.company.values.join(', ')}\n\nDaily Fun was founded by Stefan Kunc to prove that news doesn't have to be boring!`;
      }
    }
    
    // Check for sources request
    if (input.includes('sources') || input.includes('source') || input.includes('quellen') || input.includes('quelle')) {
      for (const articleTitle in articleDatabase) {
        const translatedTitle = language === 'de' ? t(`article.${articles.find(a => a.title === articleTitle)?.id}.title`) : articleTitle;
        
        if (input.includes(articleTitle.toLowerCase()) || 
            input.includes(translatedTitle.toLowerCase()) ||
            articleTitle.toLowerCase().includes(input.replace(/give me the|sources|quellen|für|for|the|gib|mir|die/g, '').trim()) ||
            translatedTitle.toLowerCase().includes(input.replace(/give me the|sources|quellen|für|for|the|gib|mir|die/g, '').trim())) {
          
          const article = articleDatabase[articleTitle];
          const displayTitle = language === 'de' ? translatedTitle : articleTitle;
          
          if (language === 'de') {
            return `Hier sind die Quellen für "${displayTitle}":\n\n${article.sources.map((source, index) => `${index + 1}. ${source}`).join('\n')}`;
          } else {
            return `Here are the sources for "${displayTitle}":\n\n${article.sources.map((source, index) => `${index + 1}. ${source}`).join('\n')}`;
          }
        }
      }
      
      if (language === 'de') {
        return 'Ich konnte keine Quellen für diesen spezifischen Artikel finden. Bitte stellen Sie sicher, dass Sie nach einem unserer veröffentlichten Artikel fragen. Sie können zum Beispiel fragen: "Gib mir die Quellen für Lokale Katze zum Ehrenbürgermeister gewählt".';
      } else {
        return 'I couldn\'t find sources for that specific article. Please make sure you\'re asking about one of our published articles. You can try asking about one of our available articles.';
      }
    }
    
    // Check for more information request
    if (input.includes('more information') || input.includes('tell me more') || input.includes('details') || 
        input.includes('mehr informationen') || input.includes('erzähl mir mehr') || input.includes('details')) {
      
      for (const articleTitle in articleDatabase) {
        const translatedTitle = language === 'de' ? t(`article.${articles.find(a => a.title === articleTitle)?.id}.title`) : articleTitle;
        
        if (input.includes(articleTitle.toLowerCase()) || 
            input.includes(translatedTitle.toLowerCase()) ||
            articleTitle.toLowerCase().includes(input.replace(/tell me more|more information|erzähl mir mehr|mehr informationen|about|über|give me|gib mir/g, '').trim()) ||
            translatedTitle.toLowerCase().includes(input.replace(/tell me more|more information|erzähl mir mehr|mehr informationen|about|über|give me|gib mir/g, '').trim())) {
          
          const article = articleDatabase[articleTitle];
          const displayTitle = language === 'de' ? translatedTitle : articleTitle;
          const translatedExcerpt = language === 'de' ? t(`article.${articles.find(a => a.title === articleTitle)?.id}.excerpt`) : articles.find(a => a.title === articleTitle)?.excerpt;
          
          if (language === 'de') {
            return `Hier sind detailliertere Informationen über "${displayTitle}":\n\n${translatedExcerpt} Dieser Artikel wurde ${articles.find(a => a.title === articleTitle)?.views.toLocaleString()} Mal angesehen und gehört zu unserer ${articles.find(a => a.title === articleTitle)?.category} Kategorie.`;
          } else {
            return `Here's more detailed information about "${displayTitle}":\n\n${article.detailedInfo}`;
          }
        }
      }
      
      if (language === 'de') {
        return 'Ich konnte keine detaillierten Informationen für diesen spezifischen Artikel finden. Bitte stellen Sie sicher, dass Sie nach einem unserer veröffentlichten Artikel fragen.';
      } else {
        return 'I couldn\'t find detailed information for that specific article. Please make sure you\'re asking about one of our published articles.';
      }
    }
    
    // List all articles if asked
    if (input.includes('list') || input.includes('show') || input.includes('articles') || 
        input.includes('liste') || input.includes('zeige') || input.includes('artikel')) {
      
      const articleList = articles.map((article, index) => {
        const title = language === 'de' ? t(`article.${article.id}.title`) : article.title;
        return `${index + 1}. ${title}`;
      }).join('\n');
      
      if (language === 'de') {
        return `Hier sind alle verfügbaren Artikel:\n\n${articleList}\n\nSie können nach Quellen oder mehr Informationen zu jedem dieser Artikel fragen!`;
      } else {
        return `Here are all available articles:\n\n${articleList}\n\nYou can ask for sources or more information about any of these articles!`;
      }
    }
    
    // Default response
    if (language === 'de') {
      return 'Ich kann Ihnen helfen mit:\n\n• 📧 Kontaktinformationen\n• 👥 Team-Informationen (Stefan Kunc, Dr. Elke Schneider, Karl Bergmann, Jonas Richter)\n• 🏢 Über Daily Fun (Mission, Vision, Werte)\n• 📰 Artikel-Quellen und Details\n• 📋 Liste aller Artikel\n\nFragen Sie mich zum Beispiel: "Wer ist Stefan Kunc?" oder "Wie kann ich euch kontaktieren?"';
    } else {
      return 'I can help you with:\n\n• 📧 Contact information\n• 👥 Team information (Stefan Kunc, Dr. Elke Schneider, Karl Bergmann, Jonas Richter)\n• 🏢 About Daily Fun (Mission, Vision, Values)\n• 📰 Article sources and details\n• 📋 List of all articles\n\nTry asking: "Who is Stefan Kunc?" or "How can I contact you?"';
    }
  };

  const extractKeywordsForSearch = (query: string): string => {
    // Remove common question words and articles
    const stopWords = ['wie', 'was', 'wer', 'wo', 'wann', 'warum', 'der', 'die', 'das', 'den', 'dem', 'des', 'eine', 'ein', 'einer', 'eines', 'and', 'or', 'but', 'the', 'a', 'an', 'is', 'are', 'was', 'were', 'will', 'would', 'could', 'should', 'what', 'who', 'where', 'when', 'why', 'how'];
    
    // Split the query into words and filter out stop words
    const words = query.toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove punctuation
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word));
    
    // Take the most relevant words (limit to 6 for better search results)
    return words.slice(0, 6).join('+');
  };

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');

    // Handle internet search mode
    if (searchMode === 'internet') {
      const keywords = extractKeywordsForSearch(currentInput);
      const googleSearchUrl = `https://www.google.com/search?q=${keywords}`;
      
      // Open Google search in new tab
      window.open(googleSearchUrl, '_blank');
      
      // Add a response message
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: language === 'de' 
          ? `🔍 Google-Suche wurde in einem neuen Tab geöffnet für: "${keywords.replace(/\+/g, ' ')}"`
          : `🔍 Google search opened in new tab for: "${keywords.replace(/\+/g, ' ')}"`,
        isUser: false,
        timestamp: new Date()
      };
      
      setTimeout(() => {
        setMessages(prev => [...prev, responseMessage]);
      }, 500);
      
      return;
    }

    // Handle local search mode (existing functionality)
    setIsTyping(true);
    setTimeout(() => {
      const responseText = processAIResponse(currentInput);
      setLastAIResponse(responseText);
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Touch swipe detection for back navigation
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchEnd - touchStart;
    const isRightSwipe = distance > minSwipeDistance;
    if (isRightSwipe) {
      window.history.back();
    }
  };

  return (
    <div 
      className="min-h-screen bg-[#F7F7F7]"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <Header />
      
      {/* Back Button */}
      <div className="fixed top-20 left-4 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-white/80 backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">{language === 'de' ? 'Zurück' : 'Back'}</span>
        </Button>
      </div>
      
      <div className="pt-32 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Elegant AI Logo */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2EEAE0] to-[#1A1A1A] flex items-center justify-center mr-4">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-light text-[#1A1A1A] tracking-wide">
                Daily Fun 
                <span className="font-normal ml-2 text-[#2EEAE0]">AI</span>
              </h1>
            </div>
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#2EEAE0] to-transparent mx-auto"></div>
          </div>

          {/* Chat Container */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Chat Header */}
            <div className="px-6 py-4 bg-white border-b border-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-[#2EEAE0]/10 flex items-center justify-center mr-3">
                    <Bot className="w-4 h-4 text-[#2EEAE0]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-[#1A1A1A]">Daily Fun AI</h3>
                    <p className="text-xs text-gray-500">
                      {language === 'de' ? 'Ihr intelligenter Assistent' : 'Your intelligent assistant'}
                    </p>
                  </div>
                </div>
                
                {/* Search Mode Toggle */}
                <div className="flex bg-gray-50 rounded-lg p-1">
                  <Button
                    variant={searchMode === 'local' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSearchMode('local')}
                    className="text-xs px-3 py-1 h-7"
                  >
                    {language === 'de' ? 'Lokal' : 'Local'}
                  </Button>
                  <Button
                    variant={searchMode === 'internet' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSearchMode('internet')}
                    className="text-xs px-3 py-1 h-7"
                  >
                    {language === 'de' ? 'Internet' : 'Internet'}
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Messages Area */}
            <ScrollArea className="h-[500px] px-6 py-4" ref={scrollAreaRef}>
              <div className="space-y-6">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] ${message.isUser ? 'order-2' : ''}`}>
                      <div className={`flex items-start gap-3 ${message.isUser ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.isUser ? 'bg-[#1A1A1A]' : 'bg-[#2EEAE0]/10'
                        }`}>
                          {message.isUser ? (
                            <User className="w-4 h-4 text-white" />
                          ) : (
                            <Bot className="w-4 h-4 text-[#2EEAE0]" />
                          )}
                        </div>
                        <div className={`rounded-2xl px-4 py-3 max-w-full ${
                          message.isUser 
                            ? 'bg-[#1A1A1A] text-white' 
                            : 'bg-gray-50 text-[#1A1A1A]'
                        }`}>
                          <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">{message.text}</div>
                          <div className={`text-xs mt-2 ${
                            message.isUser ? 'text-gray-300' : 'text-gray-400'
                          }`}>
                            {message.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#2EEAE0]/10 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-[#2EEAE0]" />
                      </div>
                      <div className="bg-gray-50 rounded-2xl px-4 py-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-[#2EEAE0] rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-[#2EEAE0] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-[#2EEAE0] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            
            {/* Input Area */}
            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-50">
              <form onSubmit={e => { e.preventDefault(); sendMessage(); }} className="flex gap-3">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={language === 'de' ? 'Stellen Sie eine Frage...' : 'Ask a question...'}
                  className="flex-1 border-gray-200 focus:border-[#2EEAE0] focus:ring-[#2EEAE0]/20 rounded-xl bg-white"
                  disabled={isTyping}
                />
                <Button 
                  type="submit" 
                  disabled={!inputValue.trim() || isTyping}
                  className="bg-[#2EEAE0] hover:bg-[#2EEAE0]/90 text-black rounded-xl px-6"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AI;
