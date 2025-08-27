import React, { useState, useRef, useEffect } from 'react';
import { Send, Home, Globe, Search, X, ArrowLeft, QrCode, MessageCircle, Copy, Download, ChevronDown, Brain, Mic, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';
import { articles } from '@/data/articles';
import Header from '@/components/Header';
import { Link, useLocation } from 'react-router-dom';
import QRCode from 'qrcode';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  feedback?: 'positive' | 'negative' | null;
  qrCode?: string;
  articleSearch?: boolean;
  quizData?: {
    question: string;
    answers: string[];
    correctAnswer: string;
    explanation: string;
    selectedAnswer?: string;
    showResults?: boolean;
  };
  endConversationAvailable?: boolean;
  isSelected?: boolean;
  showSummaryButton?: boolean;
  showQuizButton?: boolean;
}

interface ActionCard {
  id: 'article-search' | 'qr-generator' | 'quiz' | 'realtime-news';
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
  },
  {
    id: 'quiz',
    titleDe: 'Quiz',
    titleEn: 'Quiz',
    icon: Brain,
    promptDe: 'Ich kann für Sie interessante Quizzes erstellen! Wählen Sie ein Thema oder probieren Sie eines unserer beliebten Quizzes aus.',
    promptEn: 'I can create interesting quizzes for you! Choose a topic or try one of our popular quizzes.'
  },
  {
    id: 'realtime-news',
    titleDe: 'Aktuelle Nachrichten',
    titleEn: 'Realtime News',
    icon: Globe,
    promptDe: 'Ich kann aktuelle Informationen aus Wikipedia, The Guardian, Google News und anderen Quellen für Sie suchen. Fragen Sie mich nach aktuellen Ereignissen!',
    promptEn: 'I can search for current information from Wikipedia, The Guardian, Google News and other sources. Ask me about current events!'
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

const SUGGESTIONS = {
  de: [
    'Zeig mir alle Artikel',
    'Finde Artikel über Humor',
    'Suche aktuelle Nachrichten',
    'Wer ist Stefan Kunc?',
    'Wie kann ich euch kontaktieren?',
    'Was ist die Mission von Daily Fun?',
  ],
  en: [
    'Show me all articles',
    'Find articles about humor',
    'Search current news',
    'Who is Stefan Kunc?',
    'How can I contact you?',
    "What is Daily Fun's mission?",
  ]
} as const;

const QUIZ_SUGGESTIONS = {
  de: [
    'Katzen Quiz',
    'Hunde Quiz',
    'Random Quiz',
    'Quiz über Geschichte',
    'Quiz über Wissenschaft',
    'Quiz über Sport',
  ],
  en: [
    'Cat Quiz',
    'Dog Quiz',
    'Random Quiz',
    'History Quiz',
    'Science Quiz',
    'Sports Quiz',
  ]
} as const;

const AI = () => {
  const { language, t } = useLanguage();
  const location = useLocation();
  const articleDatabase = createArticleDatabase();
  const companyDatabase = createCompanyDatabase();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchMode, setSearchMode] = useState<'local' | 'internet'>('internet');
  const [qrMode, setQrMode] = useState(false);
  const [quizMode, setQuizMode] = useState(false);
  const [visibleCopyButtons, setVisibleCopyButtons] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Initialize welcome message based on language
  useEffect(() => {
    const welcomeMessage = {
      id: '1',
      text: language === 'de' 
        ? 'Hallo! Ich bin Daily Fun AI. Ich kann Ihnen bei Kontaktinformationen, Team-Details, Firmen-Informationen, Artikeln und aktuellen Nachrichten helfen. Nutzen Sie die Karten unten oder fragen Sie mich direkt!'
        : 'Hello! I\'m Daily Fun AI. I can help you with contact information, team details, company information, articles and current news. Use the cards below or ask me directly!',
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

  useEffect(() => {
    let base: readonly string[];
    
    if (quizMode) {
      base = language === 'de' ? QUIZ_SUGGESTIONS.de : QUIZ_SUGGESTIONS.en;
    } else {
      base = language === 'de' ? SUGGESTIONS.de : SUGGESTIONS.en;
    }
    
    const q = inputValue.trim().toLowerCase();
    const list = q ? base.filter(s => s.toLowerCase().includes(q)) : base;
    setFilteredSuggestions(list.slice(0, 6));
  }, [inputValue, language, quizMode]);

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

  const generateQuiz = async (userInput: string): Promise<{ text: string; quizData?: any }> => {
    const input = userInput.toLowerCase();
    
    // Determine topic from input
    let topic = 'Allgemeinwissen';
    if (input.includes('katzen')) topic = 'Katzen';
    else if (input.includes('hunde')) topic = 'Hunde';
    else if (input.includes('geschichte')) topic = 'Geschichte';
    else if (input.includes('wissenschaft')) topic = 'Wissenschaft';
    else if (input.includes('sport')) topic = 'Sport';
    
    try {
      const response = await fetch('/functions/v1/generate-german-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const quiz = data.quiz;
        
        const responseText = language === 'de' 
          ? `🧠 **Quiz: ${topic}**\n\nHier ist Ihr Quiz! Wählen Sie die richtige Antwort:`
          : `🧠 **Quiz: ${topic}**\n\nHere's your quiz! Choose the correct answer:`;
        
        return { 
          text: responseText,
          quizData: quiz
        };
      } else {
        throw new Error('Quiz generation failed');
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      const errorText = language === 'de'
        ? 'Fehler beim Erstellen des Quiz. Bitte versuchen Sie es später erneut.'
        : 'Error creating quiz. Please try again later.';
      return { text: errorText };
    }
  };

  // Realtime news search function
  const searchRealtimeNews = async (query: string): Promise<{ text: string }> => {
    const langCode = language === 'de' ? 'de' : 'en';
    
    try {
      console.log('🔍 Searching realtime news for:', query);
      
      const response = await fetch('/functions/v1/realtime-news-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          language: langCode,
          sources: ['wikipedia', 'guardian', 'newsapi', 'hackernews', 'reddit']
        })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      const results = data.results || [];
      
      if (results.length === 0) {
        const noResultsText = language === 'de' 
          ? '❌ Keine aktuellen Ergebnisse gefunden. Versuchen Sie eine andere Suchanfrage.'
          : '❌ No current results found. Try a different search query.';
        return { text: noResultsText };
      }
      
      // Format results by source
      let formattedResponse = language === 'de' 
        ? `🌐 **Aktuelle Informationen zu "${query}":**\n\n`
        : `🌐 **Current Information about "${query}":**\n\n`;
      
      // Group results by source
      const sourceGroups: { [key: string]: any[] } = {};
      results.forEach((result: any) => {
        const source = result.source || 'Unknown';
        if (!sourceGroups[source]) sourceGroups[source] = [];
        sourceGroups[source].push(result);
      });
      
      // Display results grouped by source
      Object.keys(sourceGroups).forEach(source => {
        const sourceResults = sourceGroups[source];
        const emoji = source === 'Wikipedia' ? '🌐' : 
                     source === 'The Guardian' ? '📰' : 
                     source === 'Hacker News' ? '💻' : 
                     source.includes('Reddit') ? '💬' : '📰';
        
        formattedResponse += `${emoji} **${source}:**\n`;
        
        sourceResults.forEach((result: any) => {
          formattedResponse += `**${result.title}**\n${result.content}\n`;
          if (result.url) {
            formattedResponse += `🔗 [${language === 'de' ? 'Quelle' : 'Source'}](${result.url})\n`;
          }
          if (result.author) {
            formattedResponse += `✍️ ${result.author}\n`;
          }
          if (result.publishedAt) {
            const date = new Date(result.publishedAt).toLocaleDateString(langCode === 'de' ? 'de-DE' : 'en-US');
            formattedResponse += `📅 ${date}\n`;
          }
          formattedResponse += '\n';
        });
        formattedResponse += '---\n\n';
      });
      
      // Add summary
      const summaryText = language === 'de'
        ? `📊 **Zusammenfassung:** Gefunden ${results.length} aktuelle Ergebnisse aus ${Object.keys(sourceGroups).length} Quellen.`
        : `📊 **Summary:** Found ${results.length} current results from ${Object.keys(sourceGroups).length} sources.`;
      
      formattedResponse += summaryText;
      
      return { text: formattedResponse };
      
    } catch (error) {
      console.error('Realtime search error:', error);
      const errorText = language === 'de'
        ? '❌ Fehler bei der Suche nach aktuellen Informationen. Bitte versuchen Sie es später erneut.'
        : '❌ Error searching for current information. Please try again later.';
      return { text: errorText };
    }
  };

  const searchArticles = (query: string) => {
    const lowerQuery = query.toLowerCase();
    const filtered = articles.filter(article => {
      const titleDe = article.title || '';
      const titleEn = article.titleEn || '';
      const excerptDe = article.excerpt || '';
      const excerptEn = article.excerptEn || '';
      const contentDe = article.content || '';
      const contentEn = article.contentEn || '';
      const categoryDe = article.category || '';
      const categoryEn = article.categoryEn || '';
      const haystack = [
        titleDe, titleEn, excerptDe, excerptEn, contentDe, contentEn,
        categoryDe, categoryEn, article.author, ...(article.tags || [])
      ].join(' ').toLowerCase();
      return haystack.includes(lowerQuery);
    });
    return filtered.slice(0, 8);
  };

  const processAIResponse = async (userInput: string): Promise<{ text: string; qrCode?: string; quizData?: any }> => {
    const input = userInput.toLowerCase();
    
    // Quiz generation
    if (quizMode || input.includes('quiz')) {
      setQuizMode(false);
      return await generateQuiz(userInput);
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

    // Check for realtime news search keywords
    const newsKeywords = ['aktuelle', 'current', 'news', 'nachrichten', 'heute', 'today', 'latest', 'neueste'];
    const isNewsSearch = newsKeywords.some(keyword => input.includes(keyword)) || searchMode === 'internet';

    if (isNewsSearch) {
      return await searchRealtimeNews(userInput);
    }

    // Article search
    if (input.includes('artikel') || input.includes('article') || input.includes('zeig') || input.includes('show') || input.includes('find') || input.includes('finde')) {
      const searchResults = searchArticles(userInput);
      
      if (searchResults.length > 0) {
        let responseText = language === 'de' 
          ? `📚 **Gefundene Artikel (${searchResults.length}):**\n\n`
          : `📚 **Found Articles (${searchResults.length}):**\n\n`;
        
        searchResults.forEach(article => {
          const title = language === 'de' ? article.title : (article.titleEn || article.title);
          const excerpt = language === 'de' ? article.excerpt : (article.excerptEn || article.excerpt);
          
          responseText += `**${title}**\n`;
          responseText += `${excerpt}\n`;
          responseText += `👤 ${article.author} | 📅 ${new Date(article.publishedAt).toLocaleDateString()}\n`;
          responseText += `🏷️ ${article.category} | 👀 ${article.views.toLocaleString()} ${language === 'de' ? 'Aufrufe' : 'views'}\n\n`;
        });
        
        return { text: responseText };
      } else {
        const noResults = language === 'de' 
          ? '❌ Keine passenden Artikel gefunden. Versuchen Sie andere Suchbegriffe.'
          : '❌ No matching articles found. Try different search terms.';
        return { text: noResults };
      }
    }

    // Company information queries
    if (input.includes('stefan kunc') || input.includes('founder') || input.includes('gründer')) {
      const founder = companyDatabase.founder;
      const responseText = language === 'de' 
        ? `👤 **${founder.name}** - ${founder.role}\n\n${founder.vision}\n\n📧 Kontakt: ${companyDatabase.contact.german}`
        : `👤 **${founder.name}** - ${founder.role}\n\n${founder.vision}\n\n📧 Contact: ${companyDatabase.contact.english}`;
      return { text: responseText };
    }

    if (input.includes('kontakt') || input.includes('contact') || input.includes('email')) {
      const email = language === 'de' ? companyDatabase.contact.german : companyDatabase.contact.english;
      const responseText = language === 'de' 
        ? `📧 **Kontakt:** ${email}\n\nGerne können Sie uns bei Fragen, Anregungen oder Feedback kontaktieren!`
        : `📧 **Contact:** ${email}\n\nFeel free to contact us with questions, suggestions or feedback!`;
      return { text: responseText };
    }

    if (input.includes('mission') || input.includes('vision') || input.includes('about')) {
      const company = companyDatabase.company;
      const responseText = language === 'de' 
        ? `🎯 **Mission:** ${company.mission}\n\n🚀 **Vision:** ${company.vision}\n\n💎 **Werte:** ${company.values.join(', ')}`
        : `🎯 **Mission:** ${company.mission}\n\n🚀 **Vision:** ${company.vision}\n\n💎 **Values:** ${company.values.join(', ')}`;
      return { text: responseText };
    }

    if (input.includes('team') || input.includes('mitarbeiter')) {
      let responseText = language === 'de' 
        ? '👥 **Unser Team:**\n\n'
        : '👥 **Our Team:**\n\n';
      
      companyDatabase.team.forEach(member => {
        responseText += `🤖 **${member.name}** - ${member.role}\n`;
        responseText += `${member.description}\n\n`;
      });
      
      return { text: responseText };
    }

    // Default response
    const defaultResponse = language === 'de' 
      ? 'Ich kann Ihnen bei verschiedenen Themen helfen:\n\n📚 **Artikel suchen** - "Zeig mir Artikel über [Thema]"\n🌐 **Aktuelle Nachrichten** - "Suche aktuelle Informationen über [Thema]"\n🧠 **Quiz erstellen** - "Erstelle ein Quiz über [Thema]"\n📱 **QR Code** - "Erstelle QR Code für [URL]"\n🏢 **Firmeninfo** - "Wer ist Stefan Kunc?" oder "Kontaktinformationen"\n\nWas kann ich für Sie tun?'
      : 'I can help you with various topics:\n\n📚 **Search articles** - "Show me articles about [topic]"\n🌐 **Current news** - "Search current information about [topic]"\n🧠 **Create quiz** - "Create a quiz about [topic]"\n📱 **QR Code** - "Create QR code for [URL]"\n🏢 **Company info** - "Who is Stefan Kunc?" or "Contact information"\n\nWhat can I do for you?';
    
    return { text: defaultResponse };
  };

  const handleQuizAnswer = (messageId: string, selectedAnswer: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId && msg.quizData) {
        return {
          ...msg,
          quizData: {
            ...msg.quizData,
            selectedAnswer,
            showResults: true
          }
        };
      }
      return msg;
    }));
  };

  const sendPrompt = async (text?: string) => {
    const promptText = text || inputValue;
    if (!promptText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: promptText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setShowSuggestions(false);

    try {
      const response = await processAIResponse(promptText);

      if (response.text && response.text.trim()) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response.text,
          isUser: false,
          timestamp: new Date(),
          qrCode: response.qrCode,
          quizData: response.quizData,
          endConversationAvailable: searchMode === 'internet'
        };

        setTimeout(() => {
          setMessages(prev => [...prev, aiMessage]);
          setIsTyping(false);
        }, 600);
      } else {
        setIsTyping(false);
      }
    } catch (error) {
      console.error('Error processing AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: language === 'de' 
          ? '❌ Fehler beim Verarbeiten Ihrer Anfrage. Bitte versuchen Sie es erneut.'
          : '❌ Error processing your request. Please try again.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    }
  };

  const handleActionCardClick = (card: ActionCard) => {
    const prompt = language === 'de' ? card.promptDe : card.promptEn;
    
    if (card.id === 'qr-generator') {
      setQrMode(true);
    } else if (card.id === 'quiz') {
      setQuizMode(true);
    } else if (card.id === 'realtime-news') {
      setSearchMode('internet');
    } else if (card.id === 'article-search') {
      setSearchMode('local');
    }
    
    sendPrompt(prompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendPrompt();
    }
  };

  const toggleSuggestions = () => {
    setShowSuggestions(!showSuggestions);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Link to="/" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" />
              {language === 'de' ? 'Zurück zur Startseite' : 'Back to Homepage'}
            </Link>
          </div>
          
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Daily Fun AI
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {language === 'de' 
              ? 'Ihr intelligenter Assistent für Artikel, aktuelle Nachrichten und Informationen'
              : 'Your intelligent assistant for articles, current news and information'
            }
          </p>

          {/* Search Mode Toggle */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  {searchMode === 'internet' ? <Globe className="w-4 h-4" /> : <Search className="w-4 h-4" />}
                  {searchMode === 'internet' 
                    ? (language === 'de' ? 'Internet-Suche' : 'Internet Search')
                    : (language === 'de' ? 'Artikel-Suche' : 'Article Search')
                  }
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSearchMode('internet')}>
                  <Globe className="w-4 h-4 mr-2" />
                  {language === 'de' ? 'Internet-Suche' : 'Internet Search'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSearchMode('local')}>
                  <Search className="w-4 h-4 mr-2" />
                  {language === 'de' ? 'Artikel-Suche' : 'Article Search'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {actionCards.map((card) => {
            const Icon = card.icon;
            return (
              <Button
                key={card.id}
                onClick={() => handleActionCardClick(card)}
                variant="outline"
                className="h-auto p-6 flex flex-col items-center gap-3 hover:bg-accent transition-colors"
              >
                <Icon className="w-8 h-8 text-primary" />
                <div className="text-center">
                  <div className="font-semibold mb-1">
                    {language === 'de' ? card.titleDe : card.titleEn}
                  </div>
                </div>
              </Button>
            );
          })}
        </div>

        {/* Chat Container */}
        <div className="bg-card rounded-lg border shadow-sm">
          {/* Messages */}
          <div 
            ref={scrollAreaRef}
            className="h-96 overflow-y-auto p-4 space-y-4"
          >
            {messages.map((message) => (
              <div key={message.id}>
                <div 
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} cursor-pointer`}
                  onClick={() => handleMessageClick(message.id)}
                >
                  <div className={`max-w-[80%] p-4 rounded-lg relative ${
                    message.isUser 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    <ReactMarkdown className="prose dark:prose-invert prose-sm">
                      {message.text}
                    </ReactMarkdown>
                    
                    {/* QR Code */}
                    {message.qrCode && (
                      <div className="mt-4 text-center">
                        <img 
                          src={message.qrCode} 
                          alt="QR Code" 
                          className="mx-auto rounded border"
                        />
                        <Button 
                          onClick={() => downloadQRCode(message.qrCode!)}
                          variant="outline" 
                          size="sm"
                          className="mt-2"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          {language === 'de' ? 'Herunterladen' : 'Download'}
                        </Button>
                      </div>
                    )}
                    
                    {/* Quiz */}
                    {message.quizData && (
                      <div className="mt-4 space-y-3">
                        <div className="font-semibold text-lg">
                          {message.quizData.question}
                        </div>
                        <div className="space-y-2">
                          {message.quizData.answers.map((answer: string, index: number) => (
                            <Button
                              key={index}
                              onClick={() => handleQuizAnswer(message.id, answer)}
                              variant={
                                message.quizData.showResults
                                  ? answer === message.quizData.correctAnswer
                                    ? "default"
                                    : answer === message.quizData.selectedAnswer
                                    ? "destructive"
                                    : "outline"
                                  : "outline"
                              }
                              className="w-full justify-start text-left"
                              disabled={message.quizData.showResults}
                            >
                              {answer}
                            </Button>
                          ))}
                        </div>
                        {message.quizData.showResults && (
                          <div className="mt-4 p-3 bg-accent rounded">
                            <div className="font-semibold mb-2">
                              {message.quizData.selectedAnswer === message.quizData.correctAnswer 
                                ? (language === 'de' ? '✅ Richtig!' : '✅ Correct!')
                                : (language === 'de' ? '❌ Falsch!' : '❌ Wrong!')
                              }
                            </div>
                            <div className="text-sm">
                              <strong>{language === 'de' ? 'Richtige Antwort:' : 'Correct answer:'}</strong> {message.quizData.correctAnswer}
                            </div>
                            <div className="text-sm mt-2">
                              <strong>{language === 'de' ? 'Erklärung:' : 'Explanation:'}</strong> {message.quizData.explanation}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Copy Button */}
                    {visibleCopyButtons.includes(message.id) && (
                      <Button
                        onClick={() => copyToClipboard(message.text)}
                        size="sm"
                        variant="ghost"
                        className="absolute -top-2 -right-2 opacity-75 hover:opacity-100"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t p-4">
            {/* Suggestions */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {filteredSuggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    onClick={() => sendPrompt(suggestion)}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            )}
            
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder={
                    qrMode 
                      ? (language === 'de' ? 'Link für QR Code eingeben...' : 'Enter link for QR code...')
                      : quizMode
                      ? (language === 'de' ? 'Quiz-Thema eingeben...' : 'Enter quiz topic...')
                      : (language === 'de' ? 'Frage eingeben...' : 'Enter your question...')
                  }
                  className="pr-10"
                />
                <Button
                  onClick={toggleSuggestions}
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform ${showSuggestions ? 'rotate-180' : ''}`} />
                </Button>
              </div>
              
              <Button onClick={() => sendPrompt()} disabled={!inputValue.trim() || isTyping}>
                <Send className="w-4 h-4" />
              </Button>
            </div>

            {/* Status indicators */}
            {(qrMode || quizMode) && (
              <div className="mt-2 text-sm text-muted-foreground">
                {qrMode && (language === 'de' ? '📱 QR Code Modus aktiv' : '📱 QR Code mode active')}
                {quizMode && (language === 'de' ? '🧠 Quiz Modus aktiv' : '🧠 Quiz mode active')}
                <Button 
                  onClick={() => { setQrMode(false); setQuizMode(false); }}
                  variant="ghost" 
                  size="sm"
                  className="ml-2 h-6 px-2"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AI;