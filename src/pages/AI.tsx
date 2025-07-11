import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, ChevronDown, Globe, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { articles } from '@/data/articles';
import Header from '@/components/Header';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
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
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Check for article parameter in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const articleParam = urlParams.get('article');
    
    if (articleParam) {
      const decodedArticle = decodeURIComponent(articleParam);
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

  const processAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
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
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: processAIResponse(currentInput),
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

  const getRandomArticleTitle = () => {
    const randomArticle = articles[Math.floor(Math.random() * articles.length)];
    return language === 'de' ? t(`article.${randomArticle.id}.title`) : randomArticle.title;
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <Header />
      
      <div className="flex flex-col h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)]">
        {/* Chat Messages Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {messages.length === 1 ? (
            /* Welcome Screen - Similar to Homepage */
            <div className="flex-1 flex flex-col items-center justify-center px-4 max-h-full overflow-auto">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-6">
                  <Sparkles className="w-8 h-8 text-blue-accent mr-3" />
                  <h1 className="text-4xl font-bold text-black font-serif">
                    Daily Fun <span className="text-red-accent">AI</span>
                  </h1>
                </div>
                <p className="text-xl text-gray-700 max-w-2xl mx-auto font-serif">
                  {language === 'de' 
                    ? 'Ihr intelligenter Assistent für Artikel, Quellen und Einblicke'
                    : 'Your intelligent assistant for articles, sources and insights'
                  }
                </p>
              </div>
              
              {/* Quick Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-3xl w-full">
                <button 
                  onClick={() => setInputValue(
                    language === 'de' 
                      ? "Liste alle Artikel auf"
                      : "List all articles"
                  )}
                  className="p-6 bg-white hover:bg-gray-50 rounded-lg text-left transition-colors border border-gray-200 shadow-sm hover:shadow-md"
                >
                  <div className="font-bold mb-2 text-black font-serif">
                    {language === 'de' ? 'Alle Artikel anzeigen' : 'Show all articles'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {language === 'de' ? 'Sehen Sie alle verfügbaren Artikel' : 'View all available articles'}
                  </div>
                </button>
                
                <button 
                  onClick={() => {
                    const randomTitle = getRandomArticleTitle();
                    setInputValue(
                      language === 'de' 
                        ? `Gib mir die Quellen für ${randomTitle}`
                        : `Give me the sources for ${randomTitle}`
                    );
                  }}
                  className="p-6 bg-white hover:bg-gray-50 rounded-lg text-left transition-colors border border-gray-200 shadow-sm hover:shadow-md"
                >
                  <div className="font-bold mb-2 text-black font-serif">
                    {language === 'de' ? 'Artikel-Quellen' : 'Article sources'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {language === 'de' ? 'Quellen für einen zufälligen Artikel' : 'Sources for a random article'}
                  </div>
                </button>
                
                <button 
                  onClick={() => {
                    const randomTitle = getRandomArticleTitle();
                    setInputValue(
                      language === 'de' 
                        ? `Erzähl mir mehr über ${randomTitle}`
                        : `Tell me more about ${randomTitle}`
                    );
                  }}
                  className="p-6 bg-white hover:bg-gray-50 rounded-lg text-left transition-colors border border-gray-200 shadow-sm hover:shadow-md"
                >
                  <div className="font-bold mb-2 text-black font-serif">
                    {language === 'de' ? 'Mehr Informationen' : 'More information'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {language === 'de' ? 'Details zu einem Artikel' : 'Details about an article'}
                  </div>
                </button>
              </div>
            </div>
          ) : (
            /* Chat Messages View */
            <div className="flex-1 min-h-0">
              <ScrollArea className="h-full px-4 md:px-8" ref={scrollAreaRef}>
                <div className="max-w-4xl mx-auto py-8 space-y-6">
                  {messages.slice(1).map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-4 ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!message.isUser && (
                        <div className="w-8 h-8 bg-blue-accent rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                      )}
                      
                      <div
                        className={`max-w-[80%] p-4 rounded-2xl whitespace-pre-wrap leading-relaxed ${
                          message.isUser
                            ? 'bg-red-accent text-white'
                            : 'bg-gray-50 text-black border border-gray-200'
                        }`}
                      >
                        {message.text}
                      </div>
                      
                      {message.isUser && (
                        <div className="w-8 h-8 bg-red-accent rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex gap-4 justify-start">
                      <div className="w-8 h-8 bg-blue-accent rounded-full flex items-center justify-center mt-1">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-gray-50 text-black p-4 rounded-2xl border border-gray-200">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        {/* Input Area - Fixed at bottom */}
        <div className="px-4 md:px-8 pb-6 pt-4 bg-white border-t border-gray-200">
          <div className="max-w-4xl mx-auto">
            {/* Search Mode Selector */}
            <div className="mb-3">
              <Select value={searchMode} onValueChange={(value: 'local' | 'internet') => setSearchMode(value)}>
                <SelectTrigger className="w-64 bg-white border-gray-200 text-black">
                  <div className="flex items-center gap-2">
                    {searchMode === 'local' ? (
                      <>
                        <Home className="w-4 h-4 text-blue-accent" />
                        <span className="text-sm font-medium">
                          {language === 'de' ? 'Daily Fun (Lokal)' : 'Daily Fun (Local)'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Globe className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">
                          {language === 'de' ? 'Daily Fun (Internet-Suche)' : 'Daily Fun (Internet Search)'}
                        </span>
                      </>
                    )}
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local" className="cursor-pointer">
                    <div className="flex items-center gap-2 py-1">
                      <Home className="w-4 h-4 text-blue-accent" />
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {language === 'de' ? 'Daily Fun (Lokal)' : 'Daily Fun (Local)'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {language === 'de' ? 'Interne Wissensbasis' : 'Internal knowledge base'}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="internet" className="cursor-pointer">
                    <div className="flex items-center gap-2 py-1">
                      <Globe className="w-4 h-4 text-green-600" />
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {language === 'de' ? 'Daily Fun (Internet-Suche)' : 'Daily Fun (Internet Search)'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {language === 'de' ? 'Google-Suche in neuem Tab' : 'Google search in new tab'}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="relative">
              <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-200">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    searchMode === 'local' 
                      ? (language === 'de' ? "Daily Fun AI fragen" : "Ask Daily Fun AI")
                      : (language === 'de' ? "Suchbegriffe für Google eingeben" : "Enter search terms for Google")
                  }
                  className="flex-1 border-0 bg-transparent text-black placeholder-gray-500 focus:ring-0 focus:outline-none text-base"
                  disabled={isTyping}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="bg-red-accent hover:bg-red-accent/90 text-white rounded-xl p-2.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  size="icon"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="text-center mt-3">
              <p className="text-xs text-gray-500">
                {language === 'de' 
                  ? 'Daily Fun AI kann Fehler machen, auch bei Informationen über Personen, solltest du die Antworten überprüfen.'
                  : 'Daily Fun AI can make mistakes, including about people, so you should verify responses.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AI;
