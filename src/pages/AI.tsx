import React, { useState, useRef, useEffect } from 'react';
import { Send, Search, QrCode, Sparkles, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { articles } from '@/data/articles';
import Header from '@/components/Header';
import QRCode from 'qrcode';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  qrCode?: string;
}

interface Mode {
  id: 'article-search' | 'qr-generator' | 'chat';
  titleDe: string;
  titleEn: string;
  descriptionDe: string;
  descriptionEn: string;
  icon: React.ComponentType<any>;
  promptDe: string;
  promptEn: string;
}

const modes: Mode[] = [
  {
    id: 'article-search',
    titleDe: 'Artikel Suchen',
    titleEn: 'Article Search',
    descriptionDe: 'Durchsuchen Sie unsere Artikel-Sammlung',
    descriptionEn: 'Search through our article collection',
    icon: Search,
    promptDe: 'Ich kann Ihnen dabei helfen, Artikel aus unserer umfangreichen Sammlung zu finden. Beschreiben Sie einfach, wonach Sie suchen, und ich zeige Ihnen die passenden Artikel mit allen Details!',
    promptEn: 'I can help you find articles from our extensive collection. Simply describe what you\'re looking for, and I\'ll show you matching articles with all the details!'
  },
  {
    id: 'qr-generator',
    titleDe: 'QR Code generieren',
    titleEn: 'Generate QR Code',
    descriptionDe: 'Erstellen Sie QR Codes aus Links',
    descriptionEn: 'Create QR codes from links',
    icon: QrCode,
    promptDe: 'Senden Sie mir einfach einen Link und ich erstelle sofort einen QR Code dafür! Perfekt zum Teilen von Webseiten, Artikeln oder beliebigen URLs.',
    promptEn: 'Just send me a link and I\'ll instantly create a QR code for it! Perfect for sharing websites, articles, or any URLs.'
  },
  {
    id: 'chat',
    titleDe: 'Daily Fun Chat',
    titleEn: 'Daily Fun Chat',
    descriptionDe: 'Allgemeine Fragen und Informationen',
    descriptionEn: 'General questions and information',
    icon: MessageCircle,
    promptDe: 'Hallo! Ich bin Daily Fun AI. Ich kann Ihnen bei Kontaktinformationen, Team-Details, Firmen-Informationen und Artikeln helfen. Fragen Sie mich zum Beispiel: "Wer ist Stefan Kunc?" oder "Wie kann ich euch kontaktieren?"',
    promptEn: 'Hello! I\'m Daily Fun AI. I can help you with contact information, team details, company information and articles. Try asking me: "Who is Stefan Kunc?" or "How can I contact you?"'
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
  const [currentMode, setCurrentMode] = useState<Mode['id']>('chat');
  const [lastAIResponse, setLastAIResponse] = useState<string>('');
  const [articleContext, setArticleContext] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Check for article parameter in URL and initialize article context
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const articleParam = urlParams.get('article');
    
    if (articleParam && articleParam.length <= 500 && !/[<>"'&]/.test(articleParam)) {
      const decodedArticle = decodeURIComponent(articleParam).trim();
      setArticleContext(decodedArticle);
      
      // Set contextual placeholder and auto-set article search mode
      const aiQuestion = language === 'de' 
        ? `Erzähl mir mehr über ${decodedArticle}`
        : `Tell me more about ${decodedArticle}`;
      setInputValue(aiQuestion);
      setCurrentMode('article-search');
      
      // Clear the URL parameter
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [language]);

  // Initialize welcome message based on mode
  useEffect(() => {
    const selectedMode = modes.find(m => m.id === currentMode);
    if (selectedMode) {
      const welcomeMessage = {
        id: Date.now().toString(),
        text: language === 'de' ? selectedMode.promptDe : selectedMode.promptEn,
        isUser: false,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [currentMode, language]);

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

  const generateQRCode = async (url: string): Promise<string> => {
    try {
      return await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
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

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
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
    
    return filtered.slice(0, 5); // Limit to 5 results
  };

  const processAIResponse = async (userInput: string): Promise<{ text: string; qrCode?: string }> => {
    const input = userInput.toLowerCase();
    
    if (currentMode === 'qr-generator') {
      // Extract URLs from the input
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const urls = userInput.match(urlRegex);
      
      if (urls && urls.length > 0) {
        const url = urls[0];
        try {
          const qrCodeDataUrl = await generateQRCode(url);
          const responseText = language === 'de' 
            ? `QR Code erfolgreich erstellt für: ${url}\n\nSie können den QR Code herunterladen oder direkt verwenden!`
            : `QR Code successfully created for: ${url}\n\nYou can download the QR code or use it directly!`;
          return { text: responseText, qrCode: qrCodeDataUrl };
        } catch (error) {
          const errorText = language === 'de'
            ? 'Fehler beim Erstellen des QR Codes. Bitte überprüfen Sie den Link.'
            : 'Error creating QR code. Please check the link.';
          return { text: errorText };
        }
      } else {
        const helpText = language === 'de'
          ? 'Bitte senden Sie mir einen gültigen Link (beginnend mit http:// oder https://), um einen QR Code zu erstellen.\n\nBeispiel: https://www.example.com'
          : 'Please send me a valid link (starting with http:// or https://) to create a QR code.\n\nExample: https://www.example.com';
        return { text: helpText };
      }
    }
    
    if (currentMode === 'article-search') {
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
      } else {
        const noResultText = language === 'de'
          ? 'Keine passenden Artikel gefunden. Versuchen Sie es mit anderen Suchbegriffen.'
          : 'No matching articles found. Try different search terms.';
        return { text: noResultText };
      }
    }
    
    // Default chat mode responses (existing logic)
    if (input.includes('contact') || input.includes('email') || input.includes('kontakt') || input.includes('mail')) {
      const contactText = language === 'de'
        ? `Hier sind unsere Kontaktinformationen:\n\n📧 Für deutsche Anfragen: ${companyDatabase.contact.german}\n📧 Für englische Anfragen: ${companyDatabase.contact.english}\n\nWir freuen uns auf Ihre Nachricht!`
        : `Here is our contact information:\n\n📧 For German inquiries: ${companyDatabase.contact.german}\n📧 For English inquiries: ${companyDatabase.contact.english}\n\nWe look forward to hearing from you!`;
      return { text: contactText };
    }
    
    // Team information requests
    if (input.includes('stefan') || input.includes('kunc')) {
      const stefanText = language === 'de'
        ? `Stefan Kunc - Gründer & Visionär von Daily Fun:\n\n"${companyDatabase.founder.vision}"\n\nStefan ist der kreative Kopf hinter Daily Fun und hat die Plattform mit dem Ziel gegründet, Nachrichten unterhaltsam und vertrauenswürdig zu gestalten.`
        : `Stefan Kunc - Founder & Visionary of Daily Fun:\n\n"${companyDatabase.founder.vision}"\n\nStefan is the creative mind behind Daily Fun and founded the platform with the goal of making news entertaining and trustworthy.`;
      return { text: stefanText };
    }
    
    // Default response
    const defaultText = language === 'de'
      ? 'Entschuldigung, ich konnte Ihre Anfrage nicht verstehen. Können Sie Ihre Frage anders formulieren?'
      : 'Sorry, I couldn\'t understand your request. Could you rephrase your question?';
    return { text: defaultText };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

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

      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response.text,
          isUser: false,
          timestamp: new Date(),
          qrCode: response.qrCode
        };
        setMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);
      }, 1000);
    } catch (error) {
      console.error('Error processing AI response:', error);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleModeSelect = (modeId: Mode['id']) => {
    setCurrentMode(modeId);
    setMessages([]);
    setInputValue('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8 h-screen flex flex-col">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            {language === 'de' ? 'Was kann ich für Sie tun?' : 'What can I do for you?'}
          </h1>
        </div>

        {/* Mode Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {modes.map((mode) => {
            const Icon = mode.icon;
            const isActive = currentMode === mode.id;
            
            return (
              <button
                key={mode.id}
                onClick={() => handleModeSelect(mode.id)}
                className={`p-6 rounded-2xl border transition-all duration-300 hover:scale-105 ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 border-blue-400 shadow-lg shadow-blue-500/30' 
                    : 'bg-gray-800/50 border-gray-600 hover:bg-gray-700/50'
                }`}
              >
                <Icon className="h-8 w-8 mx-auto mb-3" />
                <h3 className="font-semibold text-lg mb-2">
                  {language === 'de' ? mode.titleDe : mode.titleEn}
                </h3>
                <p className="text-sm text-gray-300">
                  {language === 'de' ? mode.descriptionDe : mode.descriptionEn}
                </p>
              </button>
            );
          })}
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-800/30 rounded-2xl border border-gray-600 backdrop-blur-sm">
          {/* Messages */}
          <div 
            ref={scrollAreaRef}
            className="flex-1 p-6 overflow-y-auto space-y-4"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-2xl ${
                    message.isUser
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      : 'bg-gray-700 text-gray-100'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.text}</p>
                  {message.qrCode && (
                    <div className="mt-4 flex justify-center">
                      <img 
                        src={message.qrCode} 
                        alt="Generated QR Code" 
                        className="rounded-lg border border-gray-500"
                      />
                    </div>
                  )}
                  <span className="text-xs opacity-70 mt-2 block">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-700 p-4 rounded-2xl">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-gray-600">
            <div className="flex gap-3">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={language === 'de' ? 'Schreiben Sie hier...' : 'Type here...'}
                className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AI;