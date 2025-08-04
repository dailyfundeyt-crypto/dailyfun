import React, { useState, useRef, useEffect } from 'react';
import { Send, Home, Globe, Search, X, ArrowLeft, QrCode, MessageCircle, Copy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { articles } from '@/data/articles';
import Header from '@/components/Header';
import { Link } from 'react-router-dom';
import QRCode from 'qrcode';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  feedback?: 'positive' | 'negative' | null;
  qrCode?: string;
}

interface ActionCard {
  id: 'article-search' | 'qr-generator';
  titleDe: string;
  titleEn: string;
  icon: React.ComponentType<any>;
  promptDe: string;
  promptEn: string;
}

const actionCards: ActionCard[] = [
  {
    id: 'article-search',
    titleDe: 'Artikel Suchen',
    titleEn: 'Article Search',
    icon: Search,
    promptDe: 'Ich kann Ihnen dabei helfen, Artikel aus unserer umfangreichen Sammlung zu finden. Beschreiben Sie einfach, wonach Sie suchen, und ich zeige Ihnen die passenden Artikel mit allen Details!',
    promptEn: 'I can help you find articles from our extensive collection. Simply describe what you\'re looking for, and I\'ll show you matching articles with all the details!'
  },
  {
    id: 'qr-generator',
    titleDe: 'QR Code generieren',
    titleEn: 'Generate QR Code',
    icon: QrCode,
    promptDe: 'Senden Sie mir einfach einen Link und ich erstelle sofort einen QR Code dafür! Perfekt zum Teilen von Webseiten, Artikeln oder beliebigen URLs.',
    promptEn: 'Just send me a link and I\'ll instantly create a QR code for it! Perfect for sharing websites, articles, or any URLs.'
  }
];

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
  const [showArticleSearch, setShowArticleSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [articleContext, setArticleContext] = useState<string | null>(null);
  const [qrMode, setQrMode] = useState(false);
  const [visibleCopyButtons, setVisibleCopyButtons] = useState<string[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Check for article parameter in URL and initialize article context
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const articleParam = urlParams.get('article');
    
    if (articleParam && articleParam.length <= 500 && !/[<>"'&]/.test(articleParam)) {
      const decodedArticle = decodeURIComponent(articleParam).trim();
      setArticleContext(decodedArticle);
      
      // Set contextual placeholder and auto-set local mode
      const aiQuestion = language === 'de' 
        ? `Erzähl mir mehr über ${decodedArticle}`
        : `Tell me more about ${decodedArticle}`;
      setInputValue(aiQuestion);
      setSearchMode('local');
      
      // Clear the URL parameter
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [language]);

  // Initialize welcome message based on language and context
  useEffect(() => {
    if (articleContext) {
      const contextMessage = {
        id: '1',
        text: language === 'de' 
          ? `👋 Hallo! Ich sehe, Sie kommen von einem Artikel. Ich bin im Kontext-Modus und kann spezielle Fragen zu "${articleContext}" beantworten. Fragen Sie mich alles über diesen Artikel!`
          : `👋 Hello! I see you came from an article. I'm in context mode and can answer specific questions about "${articleContext}". Ask me anything about this article!`,
        isUser: false,
        timestamp: new Date()
      };
      setMessages([contextMessage]);
    } else {
      const welcomeMessage = {
        id: '1',
        text: language === 'de' 
          ? 'Hallo! Ich bin Daily Fun AI. Ich kann Ihnen bei Kontaktinformationen, Team-Details, Firmen-Informationen und Artikeln helfen. Fragen Sie mich zum Beispiel: "Wer ist Stefan Kunc?" oder "Wie kann ich euch kontaktieren?"'
          : 'Hello! I\'m Daily Fun AI. I can help you with contact information, team details, company information and articles. Try asking me: "Who is Stefan Kunc?" or "How can I contact you?"',
        isUser: false,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [language, articleContext]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const generateQRCode = async (url: string): Promise<string> => {
    try {
      return await QRCode.toDataURL(url, {
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  };

  const handleMessageClick = (messageId: string) => {
    setVisibleCopyButtons(prev => 
      prev.includes(messageId) 
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
    
    // Hide after 3 seconds
    setTimeout(() => {
      setVisibleCopyButtons(prev => prev.filter(id => id !== messageId));
    }, 3000);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const downloadQRCode = (qrCodeDataUrl: string) => {
    const link = document.createElement('a');
    link.download = 'qr-code.png';
    link.href = qrCodeDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const searchArticles = (query: string) => {
    const filtered = articles.filter(article => {
      const title = language === 'de' ? t(`article.${article.id}.title`) : article.title;
      const excerpt = language === 'de' ? t(`article.${article.id}.excerpt`) : article.excerpt;
      const lowerQuery = query.toLowerCase();
      
      return title.toLowerCase().includes(lowerQuery) ||
             excerpt.toLowerCase().includes(lowerQuery) ||
             article.author.toLowerCase().includes(lowerQuery) ||
             article.category.toLowerCase().includes(lowerQuery);
    });
    
    return filtered.slice(0, 5);
  };

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

  const processAIResponse = async (userInput: string): Promise<{ text: string; qrCode?: string }> => {
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
      return { text: translateResponse(lastAIResponse, detectedLanguage) };
    }

    // QR Code generation
    if (qrMode) {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const urls = userInput.match(urlRegex);
      
      if (urls && urls.length > 0) {
        const url = urls[0];
        try {
          const qrCodeDataUrl = await generateQRCode(url);
          const responseText = language === 'de' 
            ? `QR Code erfolgreich erstellt für: ${url}\n\nSie können den QR Code herunterladen oder direkt verwenden!`
            : `QR Code successfully created for: ${url}\n\nYou can download the QR code or use it directly!`;
          setQrMode(false);
          return { text: responseText, qrCode: qrCodeDataUrl };
        } catch (error) {
          const errorText = language === 'de'
            ? 'Fehler beim Erstellen des QR Codes. Bitte überprüfen Sie den Link.'
            : 'Error creating QR code. Please check the link.';
          setQrMode(false);
          return { text: errorText };
        }
      } else {
        const helpText = language === 'de'
          ? 'Bitte senden Sie mir einen gültigen Link (beginnend mit http:// oder https://), um einen QR Code zu erstellen.\n\nBeispiel: https://www.example.com'
          : 'Please send me a valid link (starting with http:// or https://) to create a QR code.\n\nExample: https://www.example.com';
        return { text: helpText };
      }
    }

    // Context-based AI responses when coming from an article
    if (articleContext && (
      input.includes('erzähl mir mehr über') || 
      input.includes('tell me more about') || 
      input.includes(articleContext.toLowerCase())
    )) {
      // Find the specific article being discussed
      const contextArticle = articles.find(article => {
        const titleDe = t(`article.${article.id}.title`);
        const titleEn = article.title;
        return titleDe.toLowerCase().includes(articleContext.toLowerCase()) ||
               titleEn.toLowerCase().includes(articleContext.toLowerCase()) ||
               articleContext.toLowerCase().includes(titleDe.toLowerCase()) ||
               articleContext.toLowerCase().includes(titleEn.toLowerCase());
      });

      if (contextArticle) {
        const title = language === 'de' ? t(`article.${contextArticle.id}.title`) : contextArticle.title;
        const excerpt = language === 'de' ? t(`article.${contextArticle.id}.excerpt`) : contextArticle.excerpt;
        
        const responseText = language === 'de'
          ? `🎯 Hier sind detaillierte Informationen über "${title}":\n\n📖 **Zusammenfassung:** ${excerpt}\n\n👤 **Autor:** ${contextArticle.author}\n📂 **Kategorie:** ${contextArticle.category}\n📅 **Veröffentlicht:** ${new Date(contextArticle.publishedAt).toLocaleDateString('de-DE')}\n👀 **Aufrufe:** ${contextArticle.views.toLocaleString()}\n\nSie können mich nach spezifischen Details, Quellen oder verwandten Artikeln fragen!`
          : `🎯 Here's detailed information about "${title}":\n\n📖 **Summary:** ${excerpt}\n\n👤 **Author:** ${contextArticle.author}\n📂 **Category:** ${contextArticle.category}\n📅 **Published:** ${new Date(contextArticle.publishedAt).toLocaleDateString('en-US')}\n👀 **Views:** ${contextArticle.views.toLocaleString()}\n\nYou can ask me for specific details, sources, or related articles!`;
        
        return { text: responseText };
      }
    }

    // Local article search for search mode
    if (searchMode === 'local') {
      const searchResults = searchArticles(userInput);
      
      if (searchResults.length > 0) {
        const resultText = language === 'de' 
          ? `📰 Ich habe ${searchResults.length} passende Artikel gefunden:\n\n`
          : `📰 I found ${searchResults.length} matching articles:\n\n`;
        
        const articleList = searchResults.map((article, index) => {
          const title = language === 'de' ? t(`article.${article.id}.title`) : article.title;
          const excerpt = language === 'de' ? t(`article.${article.id}.excerpt`) : article.excerpt;
          return `${index + 1}. **${title}**\n   ${excerpt}\n   📝 ${article.author} • 📅 ${new Date(article.publishedAt).toLocaleDateString()}\n`;
        }).join('\n');
        
        const footer = language === 'de'
          ? '\n💡 Fragen Sie nach mehr Details zu einem bestimmten Artikel!'
          : '\n💡 Ask for more details about a specific article!';
        
        return { text: resultText + articleList + footer };
      }
    }
    
    // Check for contact information requests
    if (input.includes('contact') || input.includes('email') || input.includes('kontakt') || input.includes('mail')) {
      const contactText = language === 'de'
        ? `Hier sind unsere Kontaktinformationen:\n\n📧 Für deutsche Anfragen: ${companyDatabase.contact.german}\n📧 Für englische Anfragen: ${companyDatabase.contact.english}\n\nWir freuen uns auf Ihre Nachricht!`
        : `Here is our contact information:\n\n📧 For German inquiries: ${companyDatabase.contact.german}\n📧 For English inquiries: ${companyDatabase.contact.english}\n\nWe look forward to hearing from you!`;
      return { text: contactText };
    }
    
    // Check for team information requests
    if (input.includes('team') || input.includes('staff') || input.includes('who') || input.includes('wer') || input.includes('mitarbeiter')) {
      if (input.includes('stefan') || input.includes('kunc')) {
        const stefanText = language === 'de'
          ? `Stefan Kunc - Gründer & Visionär von Daily Fun:\n\n"${companyDatabase.founder.vision}"\n\nStefan ist der kreative Kopf hinter Daily Fun und hat die Plattform mit dem Ziel gegründet, Nachrichten unterhaltsam und vertrauenswürdig zu gestalten.`
          : `Stefan Kunc - Founder & Visionary of Daily Fun:\n\n"${companyDatabase.founder.vision}"\n\nStefan is the creative mind behind Daily Fun and founded the platform with the goal of making news entertaining and trustworthy.`;
        return { text: stefanText };
      }
      
      if (input.includes('elke') || input.includes('schneider')) {
        const elke = companyDatabase.team[0];
        return { text: `${elke.name} (${elke.type}) - ${elke.role}:\n\n${elke.description}` };
      }
      
      if (input.includes('karl') || input.includes('bergmann')) {
        const karl = companyDatabase.team[1];
        return { text: `${karl.name} (${karl.type}) - ${karl.role}:\n\n${karl.description}` };
      }
      
      if (input.includes('jonas') || input.includes('richter')) {
        const jonas = companyDatabase.team[2];
        return { text: `${jonas.name} (${jonas.type}) - ${jonas.role}:\n\n${jonas.description}` };
      }
      
      // General team overview
      const teamList = companyDatabase.team.map((member, index) => 
        `${index + 1}. ${member.name} (${member.type}) - ${member.role}`
      ).join('\n');
      
      const teamText = language === 'de'
        ? `Unser Daily Fun Team:\n\n${teamList}\n\nJedes Teammitglied trägt mit einzigartigen Fähigkeiten dazu bei, Daily Fun zu der vertrauenswürdigen und unterhaltsamen Plattform zu machen, die sie heute ist!`
        : `Our Daily Fun Team:\n\n${teamList}\n\nEach team member contributes unique skills to make Daily Fun the trustworthy and entertaining platform it is today!`;
      
      return { text: teamText };
    }
    
    // Check for company information requests
    if (input.includes('about') || input.includes('company') || input.includes('mission') || input.includes('über') || input.includes('firma') || input.includes('unternehmen')) {
      const aboutText = language === 'de'
        ? `Über Daily Fun:\n\n${companyDatabase.company.mission}\n\nDaily Fun Mission: ${companyDatabase.company.vision}\n\nUnsere Werte: ${companyDatabase.company.values.join(', ')}`
        : `About Daily Fun:\n\n${companyDatabase.company.mission}\n\nDaily Fun Mission: ${companyDatabase.company.vision}\n\nOur Values: ${companyDatabase.company.values.join(', ')}`;
      
      return { text: aboutText };
    }
    
    // Default response for unmatched queries
    const defaultText = language === 'de'
      ? 'Ich kann Ihnen helfen mit:\n\n• Kontaktinformationen\n• Team-Informationen\n• Artikel-Quellen und Details\n• Liste aller Artikel\n\nFragen Sie mich zum Beispiel:\n• "Wer ist Stefan Kunc?"\n• "Wie kann ich euch kontaktieren?"\n• "Zeig mir alle Artikel"\n• "Was ist die Mission von Daily Fun?"'
      : 'I can help you with:\n\n• Contact information\n• Team information\n• Article sources and details\n• List of all articles\n\nTry asking:\n• "Who is Stefan Kunc?"\n• "How can I contact you?"\n• "Show me all articles"\n• "What is Daily Fun\'s mission?"';
    
    return { text: defaultText };
  };

  const handleActionCardClick = (card: ActionCard) => {
    if (card.id === 'qr-generator') {
      setQrMode(true);
      const prompt = language === 'de' ? card.promptDe : card.promptEn;
      const newMessage: Message = {
        id: Date.now().toString(),
        text: prompt,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newMessage]);
    } else {
      const prompt = language === 'de' ? card.promptDe : card.promptEn;
      const newMessage: Message = {
        id: Date.now().toString(),
        text: prompt,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newMessage]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await processAIResponse(inputValue);
      setLastAIResponse(response.text);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        isUser: false,
        timestamp: new Date(),
        qrCode: response.qrCode
      };

      setTimeout(() => {
        setMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);
      }, 1000);
    } catch (error) {
      console.error('Error processing AI response:', error);
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      <div className="container mx-auto px-4 pt-20 pb-8 h-screen flex flex-col">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            Daily Fun AI
          </h1>
          <p className="text-muted-foreground">
            {language === 'de' ? 'Ihre intelligente Assistentin für alle Fragen' : 'Your intelligent assistant for all questions'}
          </p>
        </div>

        {/* Mode Selection */}
        <div className="flex justify-center mb-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-1.5 border border-white/20 shadow-lg">
            <Button
              variant={searchMode === 'local' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSearchMode('local')}
              className="mr-1 rounded-xl"
            >
              <Home className="w-4 h-4 mr-2" />
              Daily Fun (Local)
            </Button>
            <Button
              variant={searchMode === 'internet' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSearchMode('internet')}
              className="rounded-xl"
            >
              <Globe className="w-4 h-4 mr-2" />
              Internet Search
            </Button>
          </div>
        </div>

        {/* Action Cards - Only visible in Local mode */}
        {searchMode === 'local' && (
          <div className="flex justify-center gap-4 mb-6">
            {actionCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.id}
                  onClick={() => handleActionCardClick(card)}
                  className="bg-white/90 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer min-w-[160px] text-center hover:scale-105"
                >
                  <div className="flex flex-col items-center">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-4 mb-4 shadow-lg">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-800 text-sm">
                      {language === 'de' ? card.titleDe : card.titleEn}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg mb-4 flex flex-col overflow-hidden">
          <div ref={scrollAreaRef} className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl relative group ${
                      message.isUser
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white ml-12 shadow-lg'
                        : 'bg-gray-50 text-gray-800 mr-12 border border-gray-100'
                    }`}
                    onClick={() => handleMessageClick(message.id)}
                  >
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.text}
                    </div>
                    {message.qrCode && (
                      <div className="mt-4 text-center relative">
                        <img 
                          src={message.qrCode} 
                          alt="Generated QR Code" 
                          className="mx-auto rounded-xl shadow-lg border max-w-[200px] h-auto"
                        />
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadQRCode(message.qrCode!);
                          }}
                          size="sm"
                          variant="outline"
                          className="mt-3 bg-white/90 hover:bg-white"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          {language === 'de' ? 'Herunterladen' : 'Download'}
                        </Button>
                      </div>
                    )}
                    <div className="text-xs opacity-70 mt-3">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                    {/* Copy button - only visible on click/hover */}
                    {visibleCopyButtons.includes(message.id) && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(message.text);
                        }}
                        size="sm"
                        variant="outline"
                        className="absolute -bottom-2 -right-2 opacity-90 bg-white shadow-lg"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl mr-12">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-4 shadow-lg">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={language === 'de' ? 'Ihre Frage...' : 'Your question...'}
              className="flex-1 rounded-xl border border-gray-200 p-3 resize-none min-h-[44px] max-h-32 bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isTyping}
              rows={1}
              style={{ height: `${Math.min(Math.max(44, inputValue.split('\n').length * 20 + 24), 128)}px` }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button 
              type="submit" 
              disabled={!inputValue.trim() || isTyping}
              className="rounded-xl px-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AI;
