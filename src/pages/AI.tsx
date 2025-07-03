
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
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

const AI = () => {
  const { language, t } = useLanguage();
  const articleDatabase = createArticleDatabase();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Initialize welcome message based on language
  useEffect(() => {
    const welcomeMessage = {
      id: '1',
      text: language === 'de' 
        ? 'Hallo! Ich bin Daily Fun AI. Ich kann Ihnen dabei helfen, Quellen für unsere Artikel zu finden oder detailliertere Informationen bereitzustellen. Versuchen Sie zu fragen: "Gib mir die Quellen für [Artikeltitel]" oder "Erzähl mir mehr über [Artikeltitel]".'
        : 'Hello! I\'m Daily Fun AI. I can help you find sources for our articles or provide more detailed information. Try asking me "Give me the sources for [article title]" or "Tell me more about [article title]".',
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
      return 'Ich kann Ihnen dabei helfen, Quellen zu finden oder mehr Informationen über Daily Fun Artikel zu erhalten. Versuchen Sie zu fragen:\n\n• "Gib mir die Quellen für [Artikeltitel]"\n• "Erzähl mir mehr über [Artikeltitel]"\n• "Liste alle Artikel auf"\n\nZum Beispiel: "Gib mir die Quellen für Lokale Katze zum Ehrenbürgermeister gewählt"';
    } else {
      return 'I can help you with finding sources or getting more information about Daily Fun articles. Try asking:\n\n• "Give me the sources for [article title]"\n• "Tell me more about [article title]"\n• "List all articles"\n\nFor example: "Give me the sources for Local Cat Elected as Honorary Mayor"';
    }
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
    setInputValue('');
    setIsTyping(true);

    // Simulate AI thinking delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: processAIResponse(inputValue),
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
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-8">
        <div className="w-full max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-black mb-4">
              Daily Fun <span className="text-red-accent">AI</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {language === 'de' 
                ? 'Ihr intelligenter Assistent für Artikel, Quellen und Einblicke'
                : 'Your intelligent assistant for articles, sources, and insights'
              }
            </p>
          </div>

          {/* Chat Container */}
          <div className="w-full max-w-3xl mx-auto">
            {/* Messages Area */}
            <div className="mb-6">
              <ScrollArea className="h-[500px] w-full rounded-xl border border-gray-200 bg-white shadow-sm" ref={scrollAreaRef}>
                <div className="p-6 space-y-6">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-4 ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!message.isUser && (
                        <div className="w-8 h-8 bg-blue-accent rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                      )}
                      
                      <div
                        className={`max-w-[85%] p-4 rounded-2xl whitespace-pre-wrap leading-relaxed ${
                          message.isUser
                            ? 'bg-red-accent text-white rounded-br-md'
                            : 'bg-gray-50 text-gray-900 rounded-bl-md border border-gray-100'
                        }`}
                      >
                        {message.text}
                      </div>
                      
                      {message.isUser && (
                        <div className="w-8 h-8 bg-red-accent rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <User className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex gap-4 justify-start">
                      <div className="w-8 h-8 bg-blue-accent rounded-full flex items-center justify-center mt-1">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div className="bg-gray-50 text-gray-900 p-4 rounded-2xl rounded-bl-md border border-gray-100">
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

            {/* Input Area - ChatGPT Style */}
            <div className="relative">
              <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-200">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    language === 'de' 
                      ? "Fragen Sie mich nach Artikelquellen oder weiteren Informationen..."
                      : "Ask me about article sources or for more information..."
                  }
                  className="flex-1 border-0 bg-transparent text-gray-900 placeholder-gray-500 focus:ring-0 focus:outline-none text-base"
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
              
              {/* Suggestions */}
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500 mb-3">
                  {language === 'de' ? 'Versuchen Sie zu fragen:' : 'Try asking:'}
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button 
                    onClick={() => setInputValue(
                      language === 'de' 
                        ? "Liste alle Artikel auf"
                        : "List all articles"
                    )}
                    className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                  >
                    {language === 'de' ? 'Alle Artikel auflisten' : 'List all articles'}
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
                    className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                  >
                    {language === 'de' ? 'Zufällige Quellen' : 'Random sources'}
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
                    className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                  >
                    {language === 'de' ? 'Mehr Infos' : 'More info'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AI;
