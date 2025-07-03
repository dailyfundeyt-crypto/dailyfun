
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

// Simulated article data with sources for AI responses
const articleDatabase = {
  "Local Cat Elected as Honorary Mayor After Promising More Tuna for Everyone": {
    sources: [
      "Local News Tribune - June 14, 2024",
      "Pet Politics Weekly - Issue #247",
      "Election Commission Official Records"
    ],
    detailedInfo: "This unprecedented election saw Mr. Whiskers, a 4-year-old tabby cat, win with an overwhelming majority. The election campaign lasted 3 weeks and included promises of more tuna distribution, better nap spots in public areas, and a city-wide yarn ball festival. The cat's campaign manager, Sarah Johnson, reported that the feline candidate's popularity stemmed from his ability to unite voters across all demographics with his simple yet effective message of comfort and care."
  },
  "Man Discovers His Grandmother's Secret Recipe Was Just Ketchup and Love": {
    sources: [
      "Food & Family Magazine - June 14, 2024",
      "Recipe Investigation Today",
      "Family Stories Archive"
    ],
    detailedInfo: "The 30-year mystery was solved when John Martinez found his grandmother's original handwritten recipe card hidden in an old cookbook. The 'secret ingredient' that made the sauce so special was revealed to be simply Heinz ketchup mixed with genuine care and love during preparation. Food scientists explain that the emotional connection to food preparation can actually enhance flavor perception, making this discovery both heartwarming and scientifically interesting."
  }
};

const AI = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m Daily Fun AI. I can help you find sources for our articles or provide more detailed information. Try asking me "Give me the sources for [article title]" or "Tell me more about [article title]".',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const processAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    // Check for sources request
    if (input.includes('sources') || input.includes('source')) {
      for (const articleTitle in articleDatabase) {
        if (input.includes(articleTitle.toLowerCase()) || 
            articleTitle.toLowerCase().includes(input.replace(/give me the sources|sources|for|the/g, '').trim())) {
          const article = articleDatabase[articleTitle as keyof typeof articleDatabase];
          return `Here are the sources for "${articleTitle}":\n\n${article.sources.map((source, index) => `${index + 1}. ${source}`).join('\n')}`;
        }
      }
      return 'I couldn\'t find sources for that specific article. Please make sure you\'re asking about one of our published articles. You can try asking about "Local Cat Elected as Honorary Mayor" or "Man Discovers His Grandmother\'s Secret Recipe".';
    }
    
    // Check for more information request
    if (input.includes('more information') || input.includes('tell me more') || input.includes('details')) {
      for (const articleTitle in articleDatabase) {
        if (input.includes(articleTitle.toLowerCase()) || 
            articleTitle.toLowerCase().includes(input.replace(/tell me more|more information|about|give me/g, '').trim())) {
          const article = articleDatabase[articleTitle as keyof typeof articleDatabase];
          return `Here's more detailed information about "${articleTitle}":\n\n${article.detailedInfo}`;
        }
      }
      return 'I couldn\'t find detailed information for that specific article. Please make sure you\'re asking about one of our published articles. You can try asking about "Local Cat Elected as Honorary Mayor" or "Man Discovers His Grandmother\'s Secret Recipe".';
    }
    
    // Default response
    return 'I can help you with finding sources or getting more information about Daily Fun articles. Try asking:\n\n• "Give me the sources for [article title]"\n• "Tell me more about [article title]"\n\nFor example: "Give me the sources for Local Cat Elected as Honorary Mayor"';
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
              Your intelligent assistant for articles, sources, and insights
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
                  placeholder="Ask me about article sources or for more information..."
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
                <p className="text-sm text-gray-500 mb-3">Try asking:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button 
                    onClick={() => setInputValue("Give me the sources for Local Cat Elected as Honorary Mayor")}
                    className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                  >
                    Sources for cat mayor article
                  </button>
                  <button 
                    onClick={() => setInputValue("Tell me more about Man Discovers His Grandmother's Secret Recipe")}
                    className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                  >
                    More about recipe story
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
