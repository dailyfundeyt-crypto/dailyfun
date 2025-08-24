import React, { useState, useRef, useEffect } from 'react';
import { Send, Home, Globe, Search, X, ArrowLeft, QrCode, MessageCircle, Copy, Download, ChevronDown, Brain, Mic, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';
import { articles } from '@/data/articles';
import Header from '@/components/Header';
import { Link } from 'react-router-dom';
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
}

interface ActionCard {
  id: 'article-search' | 'qr-generator' | 'quiz';
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
    'Suche Artikel nach Kategorie Technik',
    'Wer ist Stefan Kunc?',
    'Wie kann ich euch kontaktieren?',
    'Was ist die Mission von Daily Fun?',
  ],
  en: [
    'Show me all articles',
    'Find articles about humor',
    'Search articles by category technology',
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
    'Quiz über Filme',
    'Quiz über Musik'
  ],
  en: [
    'Cat Quiz',
    'Dog Quiz',
    'Random Quiz',
    'History Quiz',
    'Science Quiz',
    'Sports Quiz',
    'Movie Quiz',
    'Music Quiz'
  ]
} as const;

const AI = () => {
  const { language, t } = useLanguage();
  const articleDatabase = createArticleDatabase();
  const companyDatabase = createCompanyDatabase();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchMode, setSearchMode] = useState<'local' | 'internet'>('local');
  const [lastAIResponse, setLastAIResponse] = useState<string>('');
  const [searchResults, setSearchResults] = useState<{ [messageId: string]: any[] }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [articleContext, setArticleContext] = useState<string | null>(null);
  const [contextArticleId, setContextArticleId] = useState<string | null>(null);
  const [autoAsk, setAutoAsk] = useState<{ question: string } | null>(null);
  const [qrMode, setQrMode] = useState(false);
  const [quizMode, setQuizMode] = useState(false);
  const [visibleCopyButtons, setVisibleCopyButtons] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

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

  // Check for article/articleId/prefill parameters in URL and initialize context
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const articleParam = urlParams.get('article');
    const articleIdParam = urlParams.get('articleId');
    const prefillParam = urlParams.get('prefill') || urlParams.get('prompt');

    let ctxTitle: string | null = null;
    let ctxId: string | null = null;

    if (articleIdParam) {
      const byId = articles.find(a => a.id === articleIdParam);
      if (byId) {
        ctxId = byId.id;
        ctxTitle = language === 'de' ? byId.title : (byId.titleEn || byId.title);
      }
    } else if (articleParam && articleParam.length <= 500 && !/[<>"'&]/.test(articleParam)) {
      const decoded = decodeURIComponent(articleParam).trim();
      ctxTitle = decoded;
      const matched = articles.find(a => [a.title?.toLowerCase(), a.titleEn?.toLowerCase()].includes(decoded.toLowerCase()));
      if (matched) ctxId = matched.id;
    }

    if (ctxTitle) {
      setArticleContext(ctxTitle);
      if (ctxId) setContextArticleId(ctxId);

      const defaultPrefill = language === 'de'
        ? `Bitte gib mir eine klare, kurze Zusammenfassung von "${ctxTitle}" in 3-5 Sätzen und nenne 3 wichtige Erkenntnisse.`
        : `Please give me a clear, concise 3-5 sentence summary of "${ctxTitle}" and list 3 key takeaways.`;
      const question = (prefillParam && prefillParam.length < 300 ? prefillParam : defaultPrefill);
      setInputValue(question);
      setSearchMode('local');
      setAutoAsk({ question });

      // Clear the URL parameters
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [language]);

  // Auto-run prefilled question when provided via URL
  useEffect(() => {
    if (!autoAsk) return;
    const question = autoAsk.question;
    const send = async () => {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: question,
        isUser: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);
      setInputValue('');
      setIsTyping(true);
      try {
        const response = await processAIResponse(question);
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response.text,
          isUser: false,
          timestamp: new Date(),
          qrCode: response.qrCode,
          quizData: response.quizData,
        };
        setTimeout(() => {
          setMessages(prev => [...prev, aiMessage]);
          setIsTyping(false);
        }, 600);
      } catch (e) {
        setIsTyping(false);
      } finally {
        setAutoAsk(null);
      }
    };
    send();
  }, [autoAsk]);

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
          ? 'Hallo! Ich bin Daily Fun AI. Ich kann Ihnen bei Kontaktinformationen, Team-Details, Firmen-Informationen und Artikeln helfen. Für Internet-Suche wechseln Sie zu "Daily Fun (Internet Search)". Fragen Sie mich zum Beispiel: "Wer ist Stefan Kunc?" oder "Wie kann ich euch kontaktieren?"'
          : 'Hello! I\'m Daily Fun AI. I can help you with contact information, team details, company information and articles. For Internet search, switch to "Daily Fun (Internet Search)". Try asking me: "Who is Stefan Kunc?" or "How can I contact you?"',
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

  useEffect(() => {
    let base: readonly string[];
    
    if (quizMode) {
      base = language === 'de' ? QUIZ_SUGGESTIONS.de : QUIZ_SUGGESTIONS.en;
    } else {
      base = language === 'de' ? SUGGESTIONS.de : SUGGESTIONS.en;
    }
    
    const ctx = articleContext;
    const contextual = ctx && !quizMode
      ? (
          language === 'de'
            ? [
                `Fasse mir "${ctx}" in 3-5 Sätzen zusammen`,
                `Nenne 3 wichtige Erkenntnisse aus "${ctx}"`,
                `Wer ist der Autor von "${ctx}"?`,
                `Wann wurde "${ctx}" veröffentlicht?`,
                `In welcher Kategorie ist "${ctx}"?`,
              ]
            : [
                `Summarize "${ctx}" in 3-5 sentences`,
                `List 3 key takeaways from "${ctx}"`,
                `Who is the author of "${ctx}"?`,
                `When was "${ctx}" published?`,
                `Which category is "${ctx}" in?`,
              ]
        )
      : [];
    const merged = [...contextual, ...base];
    const q = inputValue.trim().toLowerCase();
    const list = q ? merged.filter(s => s.toLowerCase().includes(q)) : merged;
    setFilteredSuggestions(list.slice(0, 6));
  }, [inputValue, language, articleContext, quizMode]);

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

  const callOpenRouterAI = async (prompt: string, useInternetSearch: boolean = false): Promise<string> => {
    try {
      const systemPrompt = useInternetSearch 
        ? (language === 'de' 
          ? "Du bist ein hilfsreicher AI-Assistent mit Internetzugang. Du kannst aktuelle Informationen suchen und bereitstellen. Antworte immer in deutscher Sprache und verwende Markdown-Formatierung. Du hast Zugang zu aktuellen Nachrichten, Websites und Datenbanken."
          : "You are a helpful AI assistant with internet access. You can search for and provide current information. Always respond in English and use Markdown formatting. You have access to current news, websites, and databases.")
        : (language === 'de'
          ? "Du bist ein hilfsreicher AI-Assistent. Antworte immer in deutscher Sprache und verwende Markdown-Formatierung."
          : "You are a helpful AI assistant. Always respond in English and use Markdown formatting.");

      const enhancedPrompt = useInternetSearch 
        ? (language === 'de'
          ? `${prompt}\n\nBitte führe eine umfassende Internetsuche durch und stelle aktuelle, detaillierte Informationen bereit. Gib Quellen an, wo möglich.`
          : `${prompt}\n\nPlease conduct a comprehensive internet search and provide current, detailed information. Include sources where possible.`)
        : prompt;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer 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",
          "HTTP-Referer": window.location.origin,
          "X-Title": "Daily Fun AI - Internet Search",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "meta-llama/llama-3.1-405b-instruct:free",
          "messages": [
            {
              "role": "system",
              "content": systemPrompt
            },
            {
              "role": "user",
              "content": enhancedPrompt
            }
          ],
          "temperature": 0.7,
          "max_tokens": 2000,
          "top_p": 0.9
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content;

      if (!aiResponse) {
        throw new Error('No response content from OpenRouter AI');
      }

      return aiResponse;

    } catch (error) {
      console.error('OpenRouter AI API call failed:', error);
      throw error;
    }
  };

  const processAIResponse = async (userInput: string): Promise<{ text: string; qrCode?: string; quizData?: any }> => {
    const input = userInput.toLowerCase();
    
    // Quiz generation
    if (quizMode || input.includes('quiz')) {
      setQuizMode(false);
      try {
        const quizPrompt = language === 'de'
          ? `Erstelle ein Quiz zum Thema: ${userInput}. Das Quiz soll eine Frage mit 4 Antwortmöglichkeiten haben. Gib die Antwort im folgenden JSON-Format zurück:
{
  "question": "Die Quizfrage hier",
  "answers": ["Antwort A", "Antwort B", "Antwort C", "Antwort D"],
  "correctAnswer": "Die richtige Antwort hier",
  "explanation": "Erklärung warum diese Antwort richtig ist"
}`
          : `Create a quiz about: ${userInput}. The quiz should have one question with 4 answer options. Return the answer in this JSON format:
{
  "question": "The quiz question here",
  "answers": ["Answer A", "Answer B", "Answer C", "Answer D"],
  "correctAnswer": "The correct answer here",
  "explanation": "Explanation why this answer is correct"
}`;

        const quizResponse = await callOpenRouterAI(quizPrompt);
        
        try {
          const quizData = JSON.parse(quizResponse);
          return {
            text: 'INTERACTIVE_QUIZ',
            quizData: {
              question: quizData.question,
              answers: quizData.answers,
              correctAnswer: quizData.correctAnswer,
              explanation: quizData.explanation
            }
          };
        } catch (e) {
          return { text: quizResponse };
        }
      } catch (error) {
        const errorText = language === 'de'
          ? 'Fehler beim Erstellen des Quiz. Bitte versuchen Sie es erneut.'
          : 'Error creating quiz. Please try again.';
        return { text: errorText };
      }
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

    // Daily Fun (Internet Search) Mode - OpenRouter AI with Internet capabilities
    if (searchMode === 'internet') {
      try {
        console.log('🌐 Using OpenRouter AI with Internet Search for:', userInput);
        
        const aiResponse = await callOpenRouterAI(userInput, true);
        
        // Add search suggestions
        const searchQuery = encodeURIComponent(userInput);
        const searchSuggestion = language === 'de'
          ? `\n\n🔍 **Für weitere aktuelle Informationen:**\n• [Google Suche](https://www.google.com/search?q=${searchQuery})\n• [DuckDuckGo](https://duckduckgo.com/?q=${searchQuery})\n• [Wikipedia](https://de.wikipedia.org/wiki/Spezial:Suche?search=${searchQuery})`
          : `\n\n🔍 **For more current information:**\n• [Google Search](https://www.google.com/search?q=${searchQuery})\n• [DuckDuckGo](https://duckduckgo.com/?q=${searchQuery})\n• [Wikipedia](https://en.wikipedia.org/wiki/Special:Search?search=${searchQuery})`;
        
        const finalResponse = `🤖 **Daily Fun AI (Internet Search)**\n\n${aiResponse}${searchSuggestion}`;

        return { text: finalResponse };

      } catch (error) {
        console.error('❌ OpenRouter AI Internet Search failed:', error);
        const errorMessage = language === 'de'
          ? `❌ **Fehler bei der Internet-Suche**\n\nDie OpenRouter AI konnte Ihre Anfrage nicht verarbeiten. Dies kann verschiedene Gründe haben:\n\n• Netzwerkprobleme\n• API-Begrenzungen erreicht\n• Temporäre Serverprobleme\n\n**Versuchen Sie es erneut oder fragen Sie etwas anderes.**`
          : `❌ **Internet Search Error**\n\nOpenRouter AI could not process your request. This could be due to:\n\n• Network issues\n• API limits reached\n• Temporary server problems\n\n**Please try again or ask something else.**`;
        
        return { text: errorMessage };
      }
    }

    // Local mode - Handle Daily Fun specific queries
    if (searchMode === 'local') {
      // Contact information
      if (input.includes('kontakt') || input.includes('contact') || input.includes('email')) {
        const contactText = language === 'de'
          ? `📧 **Kontakt:**\n\n**Deutsch:** ${companyDatabase.contact.german}\n**English:** ${companyDatabase.contact.english}\n\nWir freuen uns auf Ihre Nachricht!`
          : `📧 **Contact:**\n\n**German:** ${companyDatabase.contact.german}\n**English:** ${companyDatabase.contact.english}\n\nWe look forward to hearing from you!`;
        
        return { text: contactText };
      }

      // Team information
      if (input.includes('team') || input.includes('mitarbeiter') || input.includes('staff')) {
        const teamText = language === 'de'
          ? `👥 **Unser Team:**\n\n**${companyDatabase.founder.name}** - ${companyDatabase.founder.role}\n${companyDatabase.founder.vision}\n\n${companyDatabase.team.map(member => `**${member.name}** - ${member.role} (${member.type})\n${member.description}`).join('\n\n')}`
          : `👥 **Our Team:**\n\n**${companyDatabase.founder.name}** - ${companyDatabase.founder.role}\n${companyDatabase.founder.vision}\n\n${companyDatabase.team.map(member => `**${member.name}** - ${member.role} (${member.type})\n${member.description}`).join('\n\n')}`;
        
        return { text: teamText };
      }

      // Stefan Kunc specific
      if (input.includes('stefan kunc') || input.includes('founder') || input.includes('gründer')) {
        const stefanText = language === 'de'
          ? `👨‍💼 **Stefan Kunc - Gründer & Vision Leader**\n\n${companyDatabase.founder.vision}\n\nStefan ist der kreative Kopf hinter Daily Fun und sorgt dafür, dass Informationen nie langweilig werden!`
          : `👨‍💼 **Stefan Kunc - Founder & Vision Leader**\n\n${companyDatabase.founder.vision}\n\nStefan is the creative mind behind Daily Fun and ensures that information is never boring!`;
        
        return { text: stefanText };
      }

      // Article search
      if (input.includes('artikel') || input.includes('article') || input.includes('alle') || input.includes('all') || input.includes('zeig') || input.includes('show')) {
        const results = searchArticles(userInput);
        if (results.length > 0) {
          const articlesText = language === 'de'
            ? `📚 **Gefundene Artikel (${results.length}):**\n\n${results.map(article => `**${article.title}**\n${article.excerpt}\n👤 ${article.author} | 📅 ${new Date(article.publishedAt).toLocaleDateString()} | 👀 ${article.views.toLocaleString()} Aufrufe\n🔗 [Artikel lesen](/article/${article.id})`).join('\n\n')}`
            : `📚 **Found Articles (${results.length}):**\n\n${results.map(article => `**${article.titleEn || article.title}**\n${article.excerptEn || article.excerpt}\n👤 ${article.author} | 📅 ${new Date(article.publishedAt).toLocaleDateString()} | 👀 ${article.views.toLocaleString()} views\n🔗 [Read article](/article/${article.id})`).join('\n\n')}`;
          
          return { text: articlesText };
        }
      }

      // Company information
      if (input.includes('mission') || input.includes('vision') || input.includes('unternehmen') || input.includes('company') || input.includes('daily fun')) {
        const aboutText = language === 'de'
          ? `🏢 **Über Daily Fun:**\n\n**Mission:** ${companyDatabase.company.mission}\n\n**Vision:** ${companyDatabase.company.vision}\n\n**Unsere Werte:** ${companyDatabase.company.values.join(', ')}`
          : `🏢 **About Daily Fun:**\n\n**Mission:** ${companyDatabase.company.mission}\n\n**Vision:** ${companyDatabase.company.vision}\n\n**Our Values:** ${companyDatabase.company.values.join(', ')}`;
        
        return { text: aboutText };
      }
    }
    
    // Default response for unmatched queries
    const defaultText = language === 'de'
      ? 'Ich kann Ihnen helfen mit:\n\n• Kontaktinformationen\n• Team-Informationen\n• Artikel-Quellen und Details\n• Liste aller Artikel\n\nFragen Sie mich zum Beispiel:\n• "Wer ist Stefan Kunc?"\n• "Wie kann ich euch kontaktieren?"\n• "Zeig mir alle Artikel"\n• "Was ist die Mission von Daily Fun?"\n\n💡 **Tipp:** Wechseln Sie zu "Daily Fun (Internet Search)" für aktuelle Informationen aus dem Internet!'
      : 'I can help you with:\n\n• Contact information\n• Team information\n• Article sources and details\n• List of all articles\n\nTry asking:\n• "Who is Stefan Kunc?"\n• "How can I contact you?"\n• "Show me all articles"\n• "What is Daily Fun\'s mission?"\n\n💡 **Tip:** Switch to "Daily Fun (Internet Search)" for current information from the internet!';
    
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
    } else if (card.id === 'article-search') {
      const prompt = language === 'de' ? card.promptDe : card.promptEn;
      const newMessage: Message = {
        id: Date.now().toString(),
        text: prompt,
        isUser: false,
        timestamp: new Date(),
        articleSearch: true
      };
      setMessages(prev => [...prev, newMessage]);
    } else if (card.id === 'quiz') {
      setQuizMode(true);
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

  const handleArticleSearchInput = (messageId: string, query: string) => {
    if (query.trim()) {
      const results = searchArticles(query);
      setSearchResults(prev => ({ ...prev, [messageId]: results }));
    } else {
      setSearchResults(prev => ({ ...prev, [messageId]: [] }));
    }
  };

  const handleArticleClick = (article: any) => {
    // Navigate to article page
    window.location.href = `/article/${article.id}`;
  };

  const sendPrompt = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await processAIResponse(text);
      setLastAIResponse(response.text);

      // Only add AI message if there's actual text content
      if (response.text && response.text.trim()) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response.text,
          isUser: false,
          timestamp: new Date(),
          qrCode: response.qrCode,
          quizData: response.quizData,
          endConversationAvailable: searchMode === 'internet',
        };

        setTimeout(() => {
          setMessages(prev => [...prev, aiMessage]);
          setIsTyping(false);
        }, 800);
      } else {
        setIsTyping(false);
      }
    } catch (error) {
      setIsTyping(false);
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
    const currentInput = inputValue;
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await processAIResponse(currentInput);
      setLastAIResponse(response.text);

      // Only add AI message if there's actual text content
      if (response.text && response.text.trim()) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response.text,
          isUser: false,
          timestamp: new Date(),
          qrCode: response.qrCode,
          quizData: response.quizData,
          endConversationAvailable: searchMode === 'internet',
        };

        setTimeout(() => {
          setMessages(prev => [...prev, aiMessage]);
          setIsTyping(false);
        }, 1000);
      } else {
        setIsTyping(false);
      }
    } catch (error) {
      console.error('Error processing AI response:', error);
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      <Header />
      
      {/* Small Daily Fun AI title in upper corner */}
      <div className="absolute top-24 left-4 z-10">
        <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Daily Fun AI
        </h1>
      </div>

      {/* Full page chat area */}
      <div className="flex-1 pt-32 pb-32 px-4 overflow-hidden">
        <div ref={scrollAreaRef} className="h-full overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-4 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-2xl relative group ${
                    message.isUser
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'bg-white text-gray-800 border border-gray-100 shadow-sm'
                  }`}
                  onClick={() => handleMessageClick(message.id)}
                >
                  {/* Interactive Quiz Display */}
                  {message.text === 'INTERACTIVE_QUIZ' && message.quizData ? (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {message.quizData.question}
                      </h3>
                      <div className="space-y-2">
                        {message.quizData.answers.map((answer: string, index: number) => {
                          const answerLetter = String.fromCharCode(65 + index);
                          const isCorrect = answer === message.quizData.correctAnswer;
                          const isSelected = answer === message.quizData.selectedAnswer;
                          const showResults = message.quizData.showResults;
                         
                         let buttonClass = "w-full text-left p-3 rounded-lg border transition-all duration-200 ";
                         
                         if (showResults) {
                           if (isCorrect) {
                             buttonClass += "bg-green-100 border-green-300 text-green-800";
                           } else if (isSelected && !isCorrect) {
                             buttonClass += "bg-red-100 border-red-300 text-red-800";
                           } else {
                             buttonClass += "bg-gray-100 border-gray-200 text-gray-600";
                           }
                         } else {
                           buttonClass += "bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-800";
                         }
                         
                         return (
                           <button
                             key={index}
                             onClick={(e) => {
                               e.stopPropagation();
                               !showResults && handleQuizAnswer(message.id, answer);
                             }}
                             disabled={showResults}
                             className={buttonClass}
                           >
                             <div className="flex items-start gap-3">
                               <span className="font-semibold text-lg">
                                 {answerLetter}.
                               </span>
                               <span className="flex-1">{answer}</span>
                               {showResults && isCorrect && (
                                 <span className="text-green-600 font-semibold">
                                   ✓ {language === 'de' ? 'Richtige Antwort' : 'Correct Answer'}
                                 </span>
                               )}
                               {showResults && isSelected && !isCorrect && (
                                 <span className="text-red-600 font-semibold">
                                   ✗ {language === 'de' ? 'Nicht ganz' : 'Not quite'}
                                 </span>
                               )}
                             </div>
                           </button>
                         );
                       })}
                     </div>
                     
                     {message.quizData.showResults && (
                       <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                         <p className="text-blue-800">
                           <strong>{language === 'de' ? 'Erklärung:' : 'Explanation:'}</strong> {message.quizData.explanation}
                         </p>
                         <div className="mt-3">
                           <Button
                             onClick={(e) => {
                               e.stopPropagation();
                               sendPrompt(language === 'de' ? 'Random Quiz' : 'Random Quiz');
                             }}
                             size="sm"
                             variant="outline"
                             className="bg-white"
                           >
                             {language === 'de' ? 'Nächste Frage' : 'Next Question'}
                           </Button>
                         </div>
                       </div>
                     )}
                   </div>
                  ) : (
                    <div>
                      <div className="text-sm leading-relaxed">
                        <ReactMarkdown 
                          className="prose prose-sm max-w-none"
                          components={{
                            p: ({ children }) => <p className="mb-2">{children}</p>,
                            h1: ({ children }) => <h1 className="text-xl font-bold mb-2">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-lg font-semibold mb-2">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-base font-medium mb-1">{children}</h3>,
                            ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
                            li: ({ children }) => <li className="mb-1">{children}</li>,
                            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                            em: ({ children }) => <em className="italic">{children}</em>,
                            a: ({ href, children }) => (
                              <a 
                                href={href} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-blue-600 hover:text-blue-800 underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {children}
                              </a>
                            ),
                          }}
                        >
                          {message.text}
                        </ReactMarkdown>
                      </div>
                      
                      {/* QR Code Display */}
                      {message.qrCode && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                          <img 
                            src={message.qrCode} 
                            alt="QR Code" 
                            className="mx-auto mb-3 rounded-lg border border-gray-300" 
                          />
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadQRCode(message.qrCode!);
                            }}
                            size="sm"
                            variant="outline"
                            className="bg-white"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            {language === 'de' ? 'QR Code herunterladen' : 'Download QR Code'}
                          </Button>
                        </div>
                      )}

                      {/* Article Search Interface */}
                      {message.articleSearch && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex gap-2 mb-3">
                            <Input
                              placeholder={language === 'de' ? 'Artikel suchen...' : 'Search articles...'}
                              value={searchQuery}
                              onChange={(e) => {
                                setSearchQuery(e.target.value);
                                handleArticleSearchInput(message.id, e.target.value);
                              }}
                              className="flex-1"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleArticleSearchInput(message.id, searchQuery);
                              }}
                            >
                              <Search className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          {searchResults[message.id] && searchResults[message.id].length > 0 && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-blue-800">
                                {language === 'de' 
                                  ? `${searchResults[message.id].length} Artikel gefunden:`
                                  : `${searchResults[message.id].length} articles found:`
                                }
                              </p>
                              {searchResults[message.id].map((article: any) => (
                                <button
                                  key={article.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleArticleClick(article);
                                  }}
                                  className="w-full text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                                >
                                  <h4 className="font-medium text-gray-900 mb-1">
                                    {language === 'de' ? article.title : (article.titleEn || article.title)}
                                  </h4>
                                  <p className="text-sm text-gray-600 mb-2">
                                    {language === 'de' ? article.excerpt : (article.excerptEn || article.excerpt)}
                                  </p>
                                  <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <span>👤 {article.author}</span>
                                    <span>📅 {new Date(article.publishedAt).toLocaleDateString()}</span>
                                    <span>👀 {article.views.toLocaleString()} {language === 'de' ? 'Aufrufe' : 'views'}</span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Copy button */}
                  {!message.isUser && visibleCopyButtons.includes(message.id) && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(message.text);
                      }}
                      size="sm"
                      variant="ghost"
                      className="absolute -bottom-2 right-2 opacity-80 hover:opacity-100"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 border border-gray-100 shadow-sm p-4 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {searchMode === 'internet' 
                        ? (language === 'de' ? 'Suche im Internet...' : 'Searching the internet...')
                        : (language === 'de' ? 'Denke nach...' : 'Thinking...')
                      }
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Action cards */}
            {messages.length === 1 && !isTyping && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                {actionCards.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => handleActionCardClick(card)}
                    className="p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                        <card.icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">
                        {language === 'de' ? card.titleDe : card.titleEn}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      {language === 'de' ? card.promptDe : card.promptEn}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Input area */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-3 items-end">
            <div className="flex-1 relative">
              {/* Mode selector */}
              <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                <DropdownMenu open={showModeDropdown} onOpenChange={setShowModeDropdown}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs font-medium hover:bg-gray-100"
                    >
                      {searchMode === 'internet' ? (
                        <>
                          <Globe className="w-3 h-3 mr-1" />
                          {language === 'de' ? 'Internet' : 'Internet'}
                        </>
                      ) : (
                        <>
                          <Home className="w-3 h-3 mr-1" />
                          {language === 'de' ? 'Lokal' : 'Local'}
                        </>
                      )}
                      <ChevronDown className="w-3 h-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64">
                    <DropdownMenuItem
                      onClick={() => {
                        setSearchMode('local');
                        setShowModeDropdown(false);
                      }}
                      className="flex items-center gap-2"
                    >
                      <Home className="w-4 h-4" />
                      <div>
                        <div className="font-medium">
                          {language === 'de' ? 'Daily Fun (Lokal)' : 'Daily Fun (Local)'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {language === 'de' 
                            ? 'Artikel, Team-Info, Kontakt'
                            : 'Articles, team info, contact'
                          }
                        </div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setSearchMode('internet');
                        setShowModeDropdown(false);
                      }}
                      className="flex items-center gap-2"
                    >
                      <Globe className="w-4 h-4" />
                      <div>
                        <div className="font-medium">
                          {language === 'de' ? 'Daily Fun (Internet Search)' : 'Daily Fun (Internet Search)'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {language === 'de' 
                            ? 'OpenRouter AI mit Internetzugang'
                            : 'OpenRouter AI with internet access'
                          }
                        </div>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  searchMode === 'internet'
                    ? (language === 'de' ? 'Fragen Sie alles - ich habe Internetzugang!' : 'Ask anything - I have internet access!')
                    : (language === 'de' ? 'Fragen Sie mich über Daily Fun...' : 'Ask me about Daily Fun...')
                }
                className="pl-32 pr-4 py-3 text-base rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                disabled={isTyping}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />

              {/* Suggestions dropdown */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg border border-gray-200 shadow-lg max-h-48 overflow-y-auto">
                  {filteredSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setInputValue(suggestion);
                        setShowSuggestions(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm first:rounded-t-lg last:rounded-b-lg"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="h-12 px-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl"
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AI;