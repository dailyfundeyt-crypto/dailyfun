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
  const [internetSeed, setInternetSeed] = useState<{ firstQuery: string; title?: string; lang: 'de' | 'en'; link?: string } | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const [puterReady, setPuterReady] = useState(false);

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

  // Load Puter AI SDK for chat and TTS
  useEffect(() => {
    const scriptId = 'puter-sdk-v2';
    if (document.getElementById(scriptId)) {
      setPuterReady(true);
      return;
    }
    const s = document.createElement('script');
    s.id = scriptId;
    s.src = 'https://js.puter.com/v2/';
    s.async = true;
    s.onload = () => setPuterReady(true);
    s.onerror = () => setPuterReady(false);
    document.body.appendChild(s);
  }, []);

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

  const generateGermanQuiz = async (userInput: string): Promise<{ text: string; quizData?: any }> => {
    const input = userInput.toLowerCase();
    
    // Determine topic from input
    let topic = 'Allgemeinwissen';
    if (input.includes('katzen')) topic = 'Katzen';
    else if (input.includes('hunde')) topic = 'Hunde';
    else if (input.includes('geschichte')) topic = 'Geschichte';
    else if (input.includes('wissenschaft')) topic = 'Wissenschaft';
    else if (input.includes('sport')) topic = 'Sport';
    else if (input.includes('filme')) topic = 'Filme';
    else if (input.includes('musik')) topic = 'Musik';
    
    try {
      // Call Supabase Edge Function for Perplexity API
      const response = await fetch('/api/generate-german-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      });
      
      if (!response.ok) {
        throw new Error('API call failed');
      }
      
      const data = await response.json();
      
      if (data.quiz) {
        return {
          text: 'INTERACTIVE_QUIZ',
          quizData: {
            question: data.quiz.question,
            answers: data.quiz.answers,
            correctAnswer: data.quiz.correctAnswer,
            explanation: data.quiz.explanation
          }
        };
      } else {
        throw new Error('No quiz data returned');
      }
    } catch (error) {
      console.error('German quiz generation failed:', error);
      // Fallback to translated English quiz
      return generateEnglishQuizWithTranslation(userInput);
    }
  };

  const generateEnglishQuizWithTranslation = async (userInput: string): Promise<{ text: string; quizData?: any }> => {
    const input = userInput.toLowerCase();
    
    // Determine quiz category
    let category = '';
    
    if (input.includes('katzen') || input.includes('cat')) {
      category = '27'; // Animals
    } else if (input.includes('hunde') || input.includes('dog')) {
      category = '27'; // Animals  
    } else if (input.includes('geschichte') || input.includes('history')) {
      category = '23'; // History
    } else if (input.includes('wissenschaft') || input.includes('science')) {
      category = '17'; // Science & Nature
    } else if (input.includes('sport')) {
      category = '21'; // Sports
    } else if (input.includes('filme') || input.includes('movie')) {
      category = '11'; // Movies
    } else if (input.includes('musik') || input.includes('music')) {
      category = '12'; // Music
    }
    
    try {
      const apiUrl = `https://opentdb.com/api.php?amount=1&type=multiple${category ? `&category=${category}` : ''}`;
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (data.response_code === 0 && data.results.length > 0) {
        const quiz = data.results[0];
        
        // Decode HTML entities
        const decodeHtml = (html: string) => {
          const txt = document.createElement('textarea');
          txt.innerHTML = html;
          return txt.value;
        };
        
        const question = decodeHtml(quiz.question);
        const correctAnswer = decodeHtml(quiz.correct_answer);
        const incorrectAnswers = quiz.incorrect_answers.map((ans: string) => decodeHtml(ans));
        
        // Improved translation for German
        const translatedContent = language === 'de' ? await improvedTranslateToGerman(question, correctAnswer, incorrectAnswers) : {
          question,
          correct: correctAnswer,
          incorrect: incorrectAnswers
        };
        
        const allAnswers = [translatedContent.correct, ...translatedContent.incorrect].sort(() => Math.random() - 0.5);
        
        // Create quiz data for interactive display
        const quizData = {
          question: translatedContent.question,
          answers: allAnswers,
          correctAnswer: translatedContent.correct,
          explanation: language === 'de' 
            ? `Die richtige Antwort ist "${translatedContent.correct}".`
            : `The correct answer is "${translatedContent.correct}".`
        };
        
        return { 
          text: 'INTERACTIVE_QUIZ',
          quizData 
        };
      } else {
        const errorText = language === 'de'
          ? '❌ Entschuldigung, ich konnte kein Quiz für dieses Thema generieren. Versuchen Sie es mit einem anderen Thema!'
          : '❌ Sorry, I couldn\'t generate a quiz for this topic. Try another topic!';
        return { text: errorText };
      }
    } catch (error) {
      const errorText = language === 'de'
        ? '❌ Fehler beim Laden des Quiz. Bitte versuchen Sie es später erneut.'
        : '❌ Error loading quiz. Please try again later.';
      return { text: errorText };
    }
  };

  const generateQuiz = async (userInput: string): Promise<{ text: string; quizData?: any }> => {
    if (language === 'de') {
      return generateGermanQuiz(userInput);
    } else {
      return generateEnglishQuizWithTranslation(userInput);
    }
  };

  const improvedTranslateToGerman = async (question: string, correct: string, incorrect: string[]) => {
    // Enhanced translation dictionary
    const translations: { [key: string]: string } = {
      // Question words
      'What': 'Was', 'Who': 'Wer', 'Where': 'Wo', 'When': 'Wann', 'Why': 'Warum', 'How': 'Wie',
      'Which': 'Welche', 'Whose': 'Wessen',
      
      // Common quiz terms
      'the smallest': 'die kleinste', 'the largest': 'die größte', 'the first': 'die erste',
      'the last': 'die letzte', 'the most': 'die meisten', 'the least': 'die wenigsten',
      'smallest': 'kleinste', 'largest': 'größte', 'biggest': 'größte', 'tiniest': 'winzigste',
      
      // Animals
      'dog': 'Hund', 'cat': 'Katze', 'dogs': 'Hunde', 'cats': 'Katzen',
      'breed': 'Rasse', 'breeds': 'Rassen', 'animal': 'Tier', 'animals': 'Tiere',
      
      // Science terms
      'temperature': 'Temperatur', 'degree': 'Grad', 'degrees': 'Grad',
      'Celsius': 'Celsius', 'Fahrenheit': 'Fahrenheit',
      
      // Common words
      'is': 'ist', 'are': 'sind', 'was': 'war', 'were': 'waren',
      'in': 'in', 'on': 'auf', 'at': 'bei', 'by': 'von',
      'world': 'Welt', 'country': 'Land', 'countries': 'Länder',
      'year': 'Jahr', 'years': 'Jahre', 'century': 'Jahrhundert',
      
      // Verbs
      'considered': 'gilt als', 'known': 'bekannt', 'called': 'genannt',
      'reach': 'erreichen', 'produce': 'produzieren', 'burn': 'brennen',
      
      // Adjectives
      'bright': 'hell', 'white': 'weiß', 'small': 'klein', 'large': 'groß',
      'high': 'hoch', 'low': 'niedrig', 'hot': 'heiß', 'cold': 'kalt'
    };

    const translateText = (text: string): string => {
      let translated = text;
      
      // Replace whole words only
      Object.entries(translations).forEach(([en, de]) => {
        const regex = new RegExp(`\\b${en}\\b`, 'gi');
        translated = translated.replace(regex, de);
      });
      
      return translated;
    };

    return {
      question: translateText(question),
      correct: translateText(correct),
      incorrect: incorrect.map(translateText)
    };
  };

  // Helpers to create nicer, more logical answers
  const stripHtml = (html: string) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const toSentences = (text: string) => text.split(/(?<=\p{L}[.!?])\s+/u).filter(Boolean);
  const summarize = (text: string, maxSentences = 4) => {
    const s = toSentences(text);
    return s.slice(0, Math.min(maxSentences, s.length)).join(' ');
  };
  const keyPoints = (text: string, tags?: string[], count = 3) => {
    const s = toSentences(text).slice(1, 10);
    const unique = Array.from(new Set(s.map(v => v.trim()))).filter(Boolean);
    const pts = unique.slice(0, count);
    if (pts.length < count && tags && tags.length) {
      const filler = tags.slice(0, count - pts.length).map(tag => language === 'de' ? `Thema: ${tag}` : `Topic: ${tag}`);
      return [...pts, ...filler];
    }
    return pts;
  };

  // Internet mode helpers (Wikipedia deep-dive for follow-up questions)
  const STOPWORDS = {
    de: ['der','die','das','und','ist','eine','einen','einem','den','des','im','in','am','an','auf','mit','für','von','oder','nicht','auch','wie','was','wer','wo','warum'],
    en: ['the','and','is','are','a','an','in','on','at','for','with','from','to','of','or','not','also','how','what','who','where','why']
  } as const;

  const getWikiExtract = async (title: string, lang: 'de' | 'en'): Promise<string> => {
    const url = `https://${lang}.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&redirects=1&titles=${encodeURIComponent(title)}&format=json&origin=*`;
    const res = await fetch(url);
    const data = await res.json();
    const pages = data?.query?.pages;
    const page = pages ? pages[Object.keys(pages)[0]] : null;
    return page?.extract || '';
  };

  const pickRelevantSentences = (extract: string, question: string, lang: 'de' | 'en', max = 4): string[] => {
    const sentences = toSentences(extract);
    const words = question.toLowerCase().split(/[^\p{L}0-9]+/u).filter(Boolean);
    const keywords = words.filter(w => w.length >= 4 && !STOPWORDS[lang].includes(w as any));
    const ranked = sentences
      .map(s => ({ s, score: keywords.reduce((acc, kw) => acc + (s.toLowerCase().includes(kw) ? 1 : 0), 0) }))
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, max)
      .map(r => r.s.trim());
    if (ranked.length > 0) return ranked;
    return sentences.slice(0, max).map(s => s.trim());
  };

  const answerInternetFollowUp = async (question: string): Promise<string> => {
    if (!internetSeed?.title || !internetSeed.lang) {
      return language === 'de' ? 'Bitte nenne erst ein Thema, dann kann ich Nachfragen beantworten.' : 'Please provide a topic first, then I can answer follow-ups.';
    }
    try {
      const extract = await getWikiExtract(internetSeed.title, internetSeed.lang);
      const rel = pickRelevantSentences(extract, question, internetSeed.lang, 4);
      const header = language === 'de'
        ? `🤖 Vertiefung zum Thema "${internetSeed.title}"\n\nAusgehend von deiner Erstfrage: "${internetSeed.firstQuery}"\nNeue Frage: "${question}"`
        : `🤖 Deep dive on "${internetSeed.title}"\n\nFrom your initial question: "${internetSeed.firstQuery}"\nNew question: "${question}"`;
      const link = internetSeed.link ? `\n\n🔗 ${internetSeed.link}` : '';
      return `${header}\n\n${rel.map(s => `• ${s}`).join('\n')}${link}`;
    } catch (e) {
      return language === 'de' ? 'Es gab ein Problem bei der vertieften Antwort.' : 'There was a problem generating the deepened answer.';
    }
  };

  // Parse 'Weitere Treffer' or 'Other results' lines from a Wikipedia message
  const parseWikiOtherResults = (text: string): string[] => {
    const markerDe = 'Weitere Treffer:';
    const markerEn = 'Other results:';
    const idx = text.indexOf(markerDe) !== -1 ? text.indexOf(markerDe) : text.indexOf(markerEn);
    if (idx === -1) return [];
    const after = text.slice(idx).split('\n').slice(1); // lines after the marker
    const titles = after
      .map(l => l.trim())
      .filter(l => l.startsWith('- '))
      .map(l => l.replace(/^-\s+/, '').trim())
      .filter(Boolean);
    return titles;
  };

  // Fetch a Wikipedia summary for a given title and build the same formatted message
  const fetchWikiSummaryForTitle = async (title: string): Promise<{ text: string; title: string; link: string; lang: 'de' | 'en' }> => {
    const langCode: 'de' | 'en' = language === 'de' ? 'de' : 'en';
    // Search again to get a fresh related list
    const searchUrl = `https://${langCode}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(title)}&utf8=&format=json&origin=*`;
    const sRes = await fetch(searchUrl);
    const sData = await sRes.json() as any;
    const first = sData?.query?.search?.[0];
    if (!first) {
      const notFound = language === 'de' ? 'Keine Ergebnisse auf Wikipedia gefunden.' : 'No results found on Wikipedia.';
      return { text: `🌐 ${notFound}`, title, link: '', lang: langCode };
    }
    const finalTitle = first.title as string;
    const sumUrl = `https://${langCode}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(finalTitle)}`;
    const sumRes = await fetch(sumUrl);
    const sumData = await sumRes.json() as any;
    const extract = sumData?.extract || '';
    const summary = summarize(extract, 3);
    const link = (sumData?.content_urls?.desktop?.page) || `https://${langCode}.wikipedia.org/wiki/${encodeURIComponent(finalTitle)}`;
    const heading = language === 'de' ? `🌐 Wikipedia: ${finalTitle}\n\nKurzfassung:` : `🌐 Wikipedia: ${finalTitle}\n\nSummary:`;
    const others = (sData?.query?.search || []).slice(1, 3).map((r: any) => `- ${r.title}`).join('\n');
    const othersHeader = others ? (language === 'de' ? '\n\nWeitere Treffer:\n' : '\n\nOther results:\n') : '';
    return { text: `${heading}\n${summary}\n\n🔗 ${link}${othersHeader}${others}`, title: finalTitle, link, lang: langCode };
  };

  // Handle clicks on 'Weitere Treffer' buttons: only Wikipedia, no AI, and update seed for follow-ups
  const handleWikiResultClick = async (title: string) => {
    try {
      const res = await fetchWikiSummaryForTitle(title);
      // Update seed so that follow-up questions refer to this latest topic
      setInternetSeed({ firstQuery: res.title, title: res.title, lang: res.lang, link: res.link });
      const aiMessage: Message = {
        id: (Date.now()).toString(),
        text: res.text,
        isUser: false,
        timestamp: new Date(),
        endConversationAvailable: true,
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (e) {
      const errText = language === 'de' ? 'Fehler beim Laden des Wikipedia-Artikels.' : 'Error loading Wikipedia article.';
      setMessages(prev => [...prev, { id: Date.now().toString(), text: `❌ ${errText}`, isUser: false, timestamp: new Date() }]);
    }
  };

  // Speak mode helpers (speech recognition + AI chat + TTS)
  const getSpeechLanguage = (): string => (language === 'de' ? 'de-DE' : 'en-GB');

  const playTTS = async (text: string) => {
    try {
      const puter = (window as any).puter;
      if (!puter?.ai?.txt2speech) return;
      const audio = await puter.ai.txt2speech(text, {
        engine: 'generative',
        language: getSpeechLanguage(),
      });
      if (audio && typeof audio.play === 'function') audio.play();
    } catch (e) {
      console.error('TTS failed', e);
    }
  };

  // Ensure Puter SDK is ready before using it
  const waitForPuterReady = async (timeoutMs = 8000): Promise<void> => {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const puter = (window as any).puter;
      if (puter?.ai?.chat) return;
      await new Promise(r => setTimeout(r, 100));
    }
    throw new Error('Puter SDK not ready');
  };

  // Extract topic from user query using AI
  const extractTopicFromQuery = async (userQuery: string): Promise<string> => {
    try {
      await waitForPuterReady();
      const puter = (window as any).puter;
      
      const prompt = language === 'de' 
        ? `Analysiere diese Frage und gib nur das Hauptthema in wenigen Worten zurück (max 3 Wörter). Frage: "${userQuery}"`
        : `Analyze this question and return only the main topic in a few words (max 3 words). Question: "${userQuery}"`;
        
      const response = await puter.ai.chat(prompt, { model: 'gemini-2.0-flash' });
      const topic = typeof response === 'string' ? response.trim() : (response?.text ?? userQuery).trim();
      return topic || userQuery;
    } catch (e) {
      console.error('Topic extraction failed:', e);
      return userQuery;
    }
  };

  // Ask the AI (Gemini 2.0 Flash with streaming). Language follows site language.
  const askPuterAI = async (prompt: string): Promise<string> => {
    try {
      await waitForPuterReady();
      const puter = (window as any).puter;

      // Nudge language explicitly
      const localizedPrompt = language === 'de'
        ? `Antworte auf Deutsch. Frage: ${prompt}`
        : `Answer in English. Question: ${prompt}`;

      // Prefer streaming for faster first tokens
      const stream = await puter.ai.chat(localizedPrompt, { model: 'gemini-2.0-flash', stream: true });
      let fullText = '';
      for await (const part of stream as any) {
        const chunk = part?.text ?? '';
        if (chunk) fullText += chunk;
      }
      if (fullText.trim()) return fullText.trim();

      // Fallback: non-streaming
      const res = await puter.ai.chat(localizedPrompt, { model: 'gemini-2.0-flash' });
      return typeof res === 'string' ? res : (res?.text ?? String(res));
    } catch (e) {
      console.error('askPuterAI failed', e);
      return language === 'de' ? '❌ Fehler bei der KI-Antwort.' : '❌ Error getting AI response.';
    }
  };

  const stopListening = () => {
    setIsListening(false);
    if (silenceTimerRef.current) {
      window.clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
  };

  const startListening = async () => {
    try { 
      // Request microphone permission with enhanced mobile settings
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      }); 
      // Stop the stream immediately as we just needed permission
      stream.getTracks().forEach(track => track.stop());
    } catch (e) {
      alert(language === 'de' 
        ? 'Mikrofon-Zugriff verweigert. Bitte erlauben Sie den Mikrofon-Zugriff in den Browser-Einstellungen.'
        : 'Microphone access denied. Please allow microphone access in browser settings.'
      );
      return;
    }
    
    const SpeechRecognition: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMessages(prev => [...prev, { id: Date.now().toString(), text: language === 'de' ? 'Spracherkennung wird von deinem Browser nicht unterstützt.' : 'Speech recognition is not supported by your browser.', isUser: false, timestamp: new Date() }]);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = getSpeechLanguage();
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = true;
    
    // Mobile specific settings
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      recognition.continuous = false;
      recognition.interimResults = false;
    }
    
    recognitionRef.current = recognition;
    setIsListening(true);

    const resetSilenceTimer = () => {
      if (silenceTimerRef.current) window.clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = window.setTimeout(() => {
        stopListening();
      }, 2000);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      setInputValue(transcript);
      
      // Reset silence timer on each word
      resetSilenceTimer();
      
      // If final result on mobile or transcript is complete, send it
      if (event.results[event.results.length - 1].isFinal || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        stopListening();
        sendSpeakPrompt(transcript);
      }
    };
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      stopListening();
    };
    recognition.onend = () => {};
    recognition.onsoundstart = resetSilenceTimer;
    recognition.onspeechstart = resetSilenceTimer;
    recognition.onaudiostart = resetSilenceTimer;
    recognition.onsoundend = resetSilenceTimer;
    recognition.onspeechend = resetSilenceTimer;
    recognition.start();
    resetSilenceTimer();
  };

  const toggleSpeakMode = async () => {
    if (!puterReady) return;
    
    if (isListening) {
      stopListening();
    } else {
      await startListening();
    }
  };

  const sendSpeakPrompt = async (promptText: string) => {
    const text = promptText.trim();
    if (!text) return;
    const userMessage: Message = { id: Date.now().toString(), text, isUser: true, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    try {
      const aiText = await askPuterAI(text);
      const aiMessage: Message = { id: (Date.now()+1).toString(), text: aiText, isUser: false, timestamp: new Date(), endConversationAvailable: searchMode === 'internet' };
      setTimeout(() => {
        setMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);
        playTTS(aiText);
      }, 600);
    } catch (e) {
      setIsTyping(false);
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

  const processAIResponse = async (userInput: string): Promise<{ text: string; qrCode?: string; quizData?: any }> => {
    const input = userInput.toLowerCase();
    const detectedLanguage = detectLanguage(userInput);
    
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

    // Internet search mode (Wikipedia + AI analysis)
    if (searchMode === 'internet') {
      const langCode: 'de' | 'en' = language === 'de' ? 'de' : 'en'
      try {
        // If we already have a seed topic, answer as a follow-up using that context
        if (internetSeed) {
          const follow = await answerInternetFollowUp(userInput);
          return { text: follow };
        }

        // Extract main topic from user's question using AI
        const extractedTopic = await extractTopicFromQuery(userInput);
        
        // First question: perform Wikipedia search using extracted topic
        const searchUrl = `https://${langCode}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(extractedTopic)}&utf8=&format=json&origin=*`
        const sRes = await fetch(searchUrl)
        const sData = await sRes.json() as any
        const first = sData?.query?.search?.[0]
        if (first) {
          const title = first.title as string
          const sumUrl = `https://${langCode}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
          const sumRes = await fetch(sumUrl)
          const sumData = await sumRes.json() as any
          const extract = sumData?.extract || ''
          
          // Send both original question and Wikipedia content to AI
          const combinedPrompt = language === 'de' 
            ? `Benutzer Frage: "${userInput}"\n\nWikipedia Informationen über "${title}":\n${extract}\n\nBitte beantworte die ursprüngliche Frage des Benutzers mit diesen Informationen und gib zusätzliche Einblicke.`
            : `User Question: "${userInput}"\n\nWikipedia Information about "${title}":\n${extract}\n\nPlease answer the user's original question using this information and provide additional insights.`;
          
          const aiResponse = await askPuterAI(combinedPrompt);
          
          const link = (sumData?.content_urls?.desktop?.page) || `https://${langCode}.wikipedia.org/wiki/${encodeURIComponent(title)}`
          const others = (sData?.query?.search || []).slice(1, 3).map((r: any) => `- ${r.title}`).join('\n')
          const othersHeader = others ? (language === 'de' ? '\n\nWeitere Treffer:\n' : '\n\nOther results:\n') : ''

          // Store seed context for follow-up questions
          setInternetSeed({ firstQuery: userInput, title, lang: langCode, link });

          return { text: `${aiResponse}\n\n🔗 ${link}${othersHeader}${others}` }
        } else {
          const notFound = language === 'de' ? 'Keine Ergebnisse auf Wikipedia gefunden.' : 'No results found on Wikipedia.'
          return { text: `🌐 ${notFound}` }
        }
      } catch (e) {
        const err = language === 'de' ? 'Fehler bei der Wikipedia-Suche.' : 'Error during Wikipedia search.'
        return { text: `❌ ${err}` }
      }
    }


    // Article-specific Q&A and summarization when context is present
    if (searchMode === 'local' && (contextArticleId || articleContext)) {
      const ctxArticle = contextArticleId
        ? articles.find(a => a.id === contextArticleId)
        : articles.find(a => {
            const ctx = (articleContext || '').toLowerCase();
            const titles = [a.title || '', a.titleEn || ''].map(t => t.toLowerCase());
            return titles.includes(ctx) || titles.some(t => t.includes(ctx));
          });
      if (ctxArticle) {
        const title = language === 'de' ? ctxArticle.title : (ctxArticle.titleEn || ctxArticle.title);
        const raw = language === 'de' ? (ctxArticle.content || ctxArticle.excerpt) : (ctxArticle.contentEn || ctxArticle.excerptEn || ctxArticle.excerpt);
        const clean = stripHtml(raw || '');
        const sum = summarize(clean, 4);
        const points = keyPoints(clean, ctxArticle.tags, 3);
        const ask = input;
        if (ask.includes('autor') || ask.includes('author')) {
          const res = language === 'de' ? `Autor: ${ctxArticle.author}` : `Author: ${ctxArticle.author}`;
          return { text: `🧑‍💻 ${res}\n\n🔗 /article/${ctxArticle.id}` };
        }
        if (ask.includes('datum') || ask.includes('date')) {
          const dateStr = new Date(ctxArticle.publishedAt).toLocaleDateString();
          const res = language === 'de' ? `Veröffentlichungsdatum: ${dateStr}` : `Published on: ${dateStr}`;
          return { text: `📅 ${res}\n\n🔗 /article/${ctxArticle.id}` };
        }
        if (ask.includes('kategorie') || ask.includes('category')) {
          const cat = language === 'de' ? (ctxArticle.category) : (ctxArticle.categoryEn || ctxArticle.category);
          const res = language === 'de' ? `Kategorie: ${cat}` : `Category: ${cat}`;
          return { text: `🏷️ ${res}\n\n🔗 /article/${ctxArticle.id}` };
        }
        const header = language === 'de' ? `📰 ${title}\n\nKurz zusammengefasst:` : `📰 ${title}\n\nIn short:`;
        const pointsHeader = language === 'de' ? '\n\nWichtige Punkte:' : '\n\nKey takeaways:';
        const factsHeader = language === 'de' ? '\n\nFakten:' : '\n\nFacts:';
        const facts = [
          language === 'de' ? `Autor: ${ctxArticle.author}` : `Author: ${ctxArticle.author}`,
          language === 'de' ? `Kategorie: ${ctxArticle.category}` : `Category: ${ctxArticle.categoryEn || ctxArticle.category}`,
          `${language === 'de' ? 'Datum' : 'Date'}: ${new Date(ctxArticle.publishedAt).toLocaleDateString()}`,
        ].join('\n- ');
        const link = `\n\n🔗 ${language === 'de' ? 'Zum Artikel' : 'Open article'}: /article/${ctxArticle.id}`;
        return { text: `${header}\n${sum}${pointsHeader}\n${points.map(p => `- ${p}`).join('\n')}${factsHeader}\n- ${facts}${link}` };
      }
    }

    // Local article search for search mode (all articles)
    if (searchMode === 'local') {
      const results = searchArticles(userInput);
      if (results.length > 0) {
        const resultText = language === 'de' 
          ? `📰 Ich habe ${results.length} passende Artikel gefunden:\n\n`
          : `📰 I found ${results.length} matching articles:\n\n`;
        const articleList = results.map((article, index) => {
          const title = language === 'de' ? (article.title) : (article.titleEn || article.title);
          const excerpt = language === 'de' ? (article.excerpt) : (article.excerptEn || article.excerpt);
          return `${index + 1}. **${title}**\n   ${excerpt}\n   🔗 /article/${article.id} \n   📝 ${article.author} • 📅 ${new Date(article.publishedAt).toLocaleDateString()}\n`;
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
      }, 800);
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
          qrCode: response.qrCode,
          quizData: response.quizData,
          endConversationAvailable: searchMode === 'internet'
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

  const endInternetConversation = () => {
    setInternetSeed(null);
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      text: language === 'de' ? '🛑 Konversation beendet. Bitte nenne ein neues Thema für die Internet-Suche.' : '🛑 Conversation ended. Please provide a new topic for Internet search.',
      isUser: false,
      timestamp: new Date()
    }]);
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
                                onClick={() => !showResults && handleQuizAnswer(message.id, answer)}
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
                                onClick={() => sendPrompt(language === 'de' ? 'Random Quiz' : 'Random Quiz')}
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
                        <div className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.text}
                        </div>
                        {parseWikiOtherResults(message.text).length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {parseWikiOtherResults(message.text).map((title, idx) => (
                              <Button
                                key={idx}
                                size="sm"
                                variant="outline"
                                className="bg-white"
                                onClick={(e) => { e.stopPropagation(); handleWikiResultClick(title); }}
                              >
                                {title}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                   
                   {/* Article Search Component */}
                   {message.articleSearch && (
                     <div className="mt-4 space-y-4">
                       <div className="relative">
                         <Input
                           type="text"
                           onChange={(e) => handleArticleSearchInput(message.id, e.target.value)}
                           placeholder={language === 'de' ? 'Stichwort oder Kategorie eingeben...' : 'Enter keyword or category...'}
                           className="pl-10 bg-gray-50 border-gray-200"
                         />
                         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                       </div>
                       
                       {searchResults[message.id] && searchResults[message.id].length > 0 && (
                         <div className="space-y-3 max-h-96 overflow-y-auto">
                           {searchResults[message.id].map((article) => {
                             const title = language === 'de' ? t(`article.${article.id}.title`) : article.title;
                             const excerpt = language === 'de' ? t(`article.${article.id}.excerpt`) : article.excerpt;
                             const imageUrl = article.imageUrl?.startsWith('/') 
                               ? article.imageUrl 
                               : `https://images.unsplash.com/${article.imageUrl}?w=300&h=200&fit=crop`;
                             
                             return (
                               <div
                                 key={article.id}
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleArticleClick(article);
                                 }}
                                 className="flex gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors border"
                               >
                                 <img
                                   src={imageUrl}
                                   alt={title}
                                   className="w-20 h-14 object-cover rounded-lg flex-shrink-0"
                                   onError={(e) => {
                                     e.currentTarget.src = '/placeholder.svg';
                                   }}
                                 />
                                 <div className="flex-1 min-w-0">
                                   <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 mb-1">
                                     {title}
                                   </h3>
                                   <p className="text-gray-600 text-xs line-clamp-2 mb-2">
                                     {excerpt}
                                   </p>
                                   <div className="flex items-center gap-2 text-xs text-gray-500">
                                     <span>{article.author}</span>
                                     <span>•</span>
                                     <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                                   </div>
                                 </div>
                               </div>
                             );
                           })}
                         </div>
                       )}
                     </div>
                   )}
                   
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
                   {message.endConversationAvailable && (
                     <div className="mt-3">
                       <Button
                         size="sm"
                         variant="outline"
                         className="bg-white"
                         onClick={(e) => { e.stopPropagation(); endInternetConversation(); }}
                       >
                         {language === 'de' ? 'Konversation beenden' : 'End conversation'}
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
                <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
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


      {/* Floating bottom container with action cards, mode switcher and input */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-2xl z-50">
        <div className="max-w-4xl mx-auto p-4 space-y-4">
          

          {/* Combined row with mode dropdown and action buttons */}
          <div className="flex items-center justify-center gap-2 md:gap-3">
            {/* Mode selector dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="justify-between bg-white shadow-sm text-xs md:text-sm px-2 md:px-4 py-1 md:py-2 h-8 md:h-10">
                  <div className="flex items-center gap-1 md:gap-2">
                    <Home className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">{searchMode === 'internet' ? 'Daily Fun (Internet Search)' : 'Daily Fun (Local)'}</span>
                    <span className="sm:hidden">{searchMode === 'internet' ? 'Internet' : 'Local'}</span>
                  </div>
                  <ChevronDown className="w-3 h-3 md:w-4 md:h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-background border z-50">
                <DropdownMenuItem
                  onClick={() => setSearchMode('local')}
                  className="flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Daily Fun (Local)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSearchMode('internet')}
                  className="flex items-center gap-2"
                >
                  <Globe className="w-4 h-4" />
                  Daily Fun (Internet Search)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Action buttons */}
            {searchMode === 'internet' ? (
              <>
                <Button
                  variant="outline"
                  onClick={toggleSpeakMode}
                  disabled={!puterReady}
                  className={`flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-4 py-1 md:py-2 h-8 md:h-10 border ${isListening ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' : 'bg-white shadow-sm'} ${!puterReady ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <Mic className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">{language === 'de' ? 'Sprechmodus' : 'Speak mode'}</span>
                  <span className="sm:hidden">{language === 'de' ? 'Sprechen' : 'Speak'}</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    const msg = language === 'de' 
                      ? '🖼️ Bildgenerator: Beschreibe das Bild, das ich erstellen soll (z. B. "Ein roter Drache über einer Stadt bei Nacht").'
                      : '🖼️ Image generator: Describe the image you want me to create (e.g., "A red dragon over a city at night").';
                    setMessages(prev => [...prev, { id: Date.now().toString(), text: msg, isUser: false, timestamp: new Date() }]);
                  }}
                  className="flex items-center gap-1 md:gap-2 bg-white shadow-sm text-xs md:text-sm px-2 md:px-4 py-1 md:py-2 h-8 md:h-10"
                >
                  <ImageIcon className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">{language === 'de' ? 'Bildgenerator' : 'Image generator'}</span>
                  <span className="sm:hidden">IMG</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    const msg = language === 'de' 
                      ? '📝 Zusammenfassung: Füge den Text ein oder beschreibe, was zusammengefasst werden soll.'
                      : '📝 Summarize: Paste the text or describe what should be summarized.';
                    setMessages(prev => [...prev, { id: Date.now().toString(), text: msg, isUser: false, timestamp: new Date() }]);
                  }}
                  className="flex items-center gap-1 md:gap-2 bg-white shadow-sm text-xs md:text-sm px-2 md:px-4 py-1 md:py-2 h-8 md:h-10"
                >
                  <MessageCircle className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">{language === 'de' ? 'Informationen zusammenfassen' : 'Summarize information'}</span>
                  <span className="sm:hidden">Sum</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    setQuizMode(true);
                    const msg = language === 'de' ? 'Ich kann ein Informations-Quiz erstellen! Nenne ein Thema.' : 'I can create an information quiz! Name a topic.';
                    setMessages(prev => [...prev, { id: Date.now().toString(), text: msg, isUser: false, timestamp: new Date() }]);
                  }}
                  className="flex items-center gap-1 md:gap-2 bg-white shadow-sm text-xs md:text-sm px-2 md:px-4 py-1 md:py-2 h-8 md:h-10"
                >
                  <Brain className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">{language === 'de' ? 'Informations-Quiz' : 'Information Quiz'}</span>
                  <span className="sm:hidden">Quiz</span>
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleActionCardClick(actionCards[0])}
                  className="flex items-center gap-1 md:gap-2 bg-white shadow-sm text-xs md:text-sm px-2 md:px-4 py-1 md:py-2 h-8 md:h-10"
                >
                  <Search className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Article Search</span>
                  <span className="sm:hidden">Search</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleActionCardClick(actionCards[1])}
                  className="flex items-center gap-1 md:gap-2 bg-white shadow-sm text-xs md:text-sm px-2 md:px-4 py-1 md:py-2 h-8 md:h-10"
                >
                  <QrCode className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Generate QR Code</span>
                  <span className="sm:hidden">QR</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleActionCardClick(actionCards[2])}
                  className="flex items-center gap-1 md:gap-2 bg-white shadow-sm text-xs md:text-sm px-2 md:px-4 py-1 md:py-2 h-8 md:h-10"
                >
                  <Brain className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Quiz</span>
                  <span className="sm:hidden">Quiz</span>
                </Button>
              </>
            )}
          </div>

          {/* Suggestions (like examples) */}
          {showSuggestions && filteredSuggestions.length > 0 && searchMode !== 'internet' && (
            <div className="flex justify-center">
              <div className="w-full md:w-[80%] bg-white/90 border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                {filteredSuggestions.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      sendPrompt(s);
                      setShowSuggestions(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-left"
                  >
                    <Search className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{s}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* WhatsApp-style Input */}
          <form onSubmit={handleSubmit} className="flex gap-2 items-end">
            <div className="flex-1 bg-gray-100 rounded-2xl border border-gray-200 p-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setShowSuggestions(searchMode !== 'internet');
                }}
                onFocus={() => setShowSuggestions(searchMode !== 'internet')}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
                placeholder={language === 'de' ? 'Nachricht...' : 'Message...'}
                className="w-full bg-transparent border-none outline-none text-sm px-2 py-1"
                disabled={isTyping}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
            </div>
            {/* Send button - only visible when there's text */}
            {inputValue.trim() !== '' && (
              <Button 
                type="submit" 
                disabled={!inputValue.trim() || isTyping}
                className="rounded-full w-10 h-10 p-0 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg"
              >
                <Send className="w-4 h-4" />
              </Button>
            )}
            
            {/* Speak mode button - positioned where send button normally is when input is empty */}
            {inputValue.trim() === '' && (
              <Button
                variant="outline"
                onClick={toggleSpeakMode}
                disabled={!puterReady}
                className={`rounded-full w-10 h-10 p-0 border ${isListening ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' : 'bg-white shadow-sm'} ${!puterReady ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <Mic className="w-4 h-4" />
              </Button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AI;