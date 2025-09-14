import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, Bot } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { getEmployeeByAuthor } from '../data/employees';
import ReactMarkdown from 'react-markdown';
import InstallSidebar from '../components/InstallSidebar';
import LanguageSwitcher from '../components/LanguageSwitcher';
import ArticleShareButton from '../components/ArticleShareButton';
import AnimatedParagraph from '../components/AnimatedParagraph';
import { useLanguage } from '../contexts/LanguageContext';
import { articles } from '../data/articles';
import { incrementViews } from '../utils/viewTracker';
import OptimizedImage from '../components/OptimizedImage';

// Professional images for article detail pages
import article1Professional from '../assets/article-1-professional.jpg';
import article2Professional from '../assets/article-2-professional.jpg';
import article3Professional from '../assets/article-3-professional.jpg';
import article4Professional from '../assets/article-4-professional.jpg';
import article5Professional from '../assets/article-5-professional.jpg';
import article6Professional from '../assets/article-6-professional.jpg';
import article7Professional from '../assets/article-7-professional.jpg';
import article8Professional from '../assets/article-8-professional.jpg';
import article9Professional from '../assets/article-9-professional.jpg';

const Article = () => {
  const { id } = useParams();
  const article = articles.find(a => a.id === id);
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleAuthorClick = () => {
    if (article) {
      const employee = getEmployeeByAuthor(article.author);
      if (employee) {
        navigate(`/search?author=${employee.id}`);
      }
    }
  };

  const employee = article ? getEmployeeByAuthor(article.author) : null;

  useEffect(() => {
    // Scroll to top when article loads
    window.scrollTo(0, 0);
    
    if (article) {
      // Increment view count when article page loads (still track internally)
      incrementViews(article.id);
    }
  }, [article]);

  if (!article) {
    return (
      <div className="min-h-screen bg-white text-black">
        <InstallSidebar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-black mb-4">{t('article.not.found')}</h1>
            <Link to="/" className="text-red-accent hover:text-blue-accent">
              {t('common.back')}
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Get translated title and excerpt
  const translatedTitle = language === 'de' ? article.title : (article.titleEn || article.title);
  const translatedExcerpt = language === 'de' ? article.excerpt : (article.excerptEn || article.excerpt);

  // Get professional image for article detail page
  const getProfessionalImage = (articleId: string) => {
    const imageMap: { [key: string]: string } = {
      '1': article1Professional,
      '2': article2Professional,
      '3': article3Professional,
      '4': article4Professional,
      '5': article5Professional,
      '6': article6Professional,
      '7': article7Professional,
      '8': article8Professional,
      '9': article9Professional,
    };
    return imageMap[articleId] || article.imageUrl;
  };

  const handleAIClick = () => {
    const translatedContent = language === 'de' ? article.content : (article.contentEn || article.content);
    const fullArticleText = `${translatedTitle}\n\n${translatedExcerpt}\n\n${translatedContent}`;
    
    navigate('/ai', {
      state: {
        articleContent: fullArticleText,
        articleTitle: translatedTitle
      }
    });
  };

  const navigateToAI = () => {
    navigate('/ai');
  };

  const handleBack = () => {
    const idx = (window.history.state && (window.history.state as any).idx) ?? 0;
    const canGoBack = idx > 0 || window.history.length > 1;
    const before = window.location.pathname + window.location.search;
    if (canGoBack) {
      navigate(-1);
      // Fallback if history back doesn't trigger (mobile edge cases)
      setTimeout(() => {
        const after = window.location.pathname + window.location.search;
        if (after === before) {
          const from = (location.state as any)?.from as string | undefined;
          if (from) navigate(from, { state: { restoreScroll: true } });
          else navigate('/search', { state: { restoreScroll: true } });
        }
      }, 300);
    } else {
      const from = (location.state as any)?.from as string | undefined;
      if (from) navigate(from, { state: { restoreScroll: true } });
      else navigate('/search', { state: { restoreScroll: true } });
    }
  };

  return (
    <div className="min-h-screen bg-white text-black relative">
      <InstallSidebar />
      
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6 relative z-10">
          <button
            onClick={handleBack}
            className="inline-flex items-center text-red-accent hover:text-blue-accent transition-colors bg-transparent border-none cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')}
          </button>
          
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={handleAIClick}
              className="inline-flex items-center px-2.5 py-1.5 md:px-4 md:py-2 bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-300 rounded-lg font-medium text-xs md:text-sm"
            >
              <Bot className="h-4 w-4 mr-2" />
              {language === 'de' ? 'Mit AI sprechen' : 'Ask AI'}
            </button>
            <ArticleShareButton articleId={article.id} title={translatedTitle} />
            <LanguageSwitcher />
          </div>
        </div>

        <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden apple-popup-animation">
          <div className="relative">
            <div className="aspect-video bg-gray-100 overflow-hidden">
              {article.id === '10' ? (
                <video 
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                  disablePictureInPicture
                  style={{ pointerEvents: 'none' }}
                >
                  <source src="/samsung-note7-video.mp4" type="video/mp4" />
                </video>
              ) : article.id === '16' ? (
                <video 
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                  disablePictureInPicture
                  style={{ pointerEvents: 'none' }}
                >
                  <source src="/missing-person-video.mp4" type="video/mp4" />
                </video>
              ) : article.id === 'google-vs-apple-poop-emoji' ? (
                <video 
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                  disablePictureInPicture
                  style={{ pointerEvents: 'none' }}
                >
                  <source src="/emoji-video.mp4" type="video/mp4" />
                </video>
              ) : article.id === 'hunger-games-schweinehund' ? (
                <video 
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                  disablePictureInPicture
                  style={{ pointerEvents: 'none' }}
                >
                  <source src="/hunger-games-video.mp4" type="video/mp4" />
                </video>
              ) : article.id === 'gta-vs-driving-license' ? (
                <video 
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                  disablePictureInPicture
                  style={{ pointerEvents: 'none' }}
                >
                  <source src="/gta-video.mp4" type="video/mp4" />
                </video>
              ) : article.id === 'doner-paradox' ? (
                <video 
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                  disablePictureInPicture
                  style={{ pointerEvents: 'none' }}
                >
                  <source src="/doner-paradox-video.mp4" type="video/mp4" />
                </video>
              ) : (
                <OptimizedImage
                  src={getProfessionalImage(article.id)}
                  alt={translatedTitle}
                  className="w-full h-full object-cover"
                  width={800}
                  height={450}
                  sizes="(max-width: 768px) 100vw, 800px"
                />
              )}
            </div>
            <div className="absolute top-4 left-4">
              <span className="bg-red-accent text-white px-3 py-1 rounded text-sm font-bold">
                {article.category}
              </span>
            </div>
          </div>

          <div className="p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-black mb-6 font-serif leading-tight">
              {translatedTitle}
            </h1>

            <div className="flex items-center text-sm text-gray-600 mb-8 pb-6 border-b border-gray-200">
              <div className="flex items-center">
                {employee && (
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={employee.image} alt={employee.name} />
                    <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
                <button 
                  onClick={handleAuthorClick}
                  className="font-medium text-gray-800 hover:text-red-accent transition-colors cursor-pointer flex items-center"
                >
                  {article.author}
                </button>
              </div>
              <div className="flex items-center ml-6">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="prose prose-lg max-w-none">
              <div className="particle-container">
                <p className="text-xl text-[#1A1A1A] mb-8 sans-serif italic leading-relaxed glow-text">
                  {translatedExcerpt}
                </p>
                <div className="particles"></div>
              </div>
              
              <div className="text-[#1A1A1A] space-y-6 sans-serif leading-relaxed">
                {article.content ? (
                  // Get the translated content
                  (() => {
                    const content = language === 'de' ? article.content : (article.contentEn || article.content);
                    // Split content into paragraphs but preserve HTML
                    const paragraphs = content.split('\n\n');
                    return paragraphs.map((paragraph, index) => {
                      // Check if paragraph contains HTML img tag
                      if (paragraph.includes('<img')) {
                        // Extract image src and alt from HTML
                        const imgMatch = paragraph.match(/<img[^>]+src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/);
                        if (imgMatch) {
                          const [, src, alt] = imgMatch;
                          return (
                            <div key={index} className="mb-6">
                              <OptimizedImage
                                src={src}
                                alt={alt}
                                className="w-full max-w-md mx-auto rounded-lg"
                                width={300}
                                height={200}
                              />
                            </div>
                          );
                        }
                        // Fallback to dangerouslySetInnerHTML if parsing fails
                        return (
                          <div 
                            key={index} 
                            className="mb-6 text-lg leading-relaxed particle-container"
                          >
                            <div dangerouslySetInnerHTML={{ __html: paragraph }} className="glow-text" />
                            <div className="particles"></div>
                          </div>
                        );
                      } else {
                        return (
                          <div key={index} className="mb-6 text-lg leading-relaxed particle-container">
                            <p className="glow-text">
                              {paragraph.replace(/\*\*(.*?)\*\*/g, '$1')}
                            </p>
                            <div className="particles"></div>
                          </div>
                        );
                      }
                    });
                  })()
                ) : (
                  // Fallback to generic content without animation
                  <>
                    <div className="particle-container">
                      <p className="mb-6 text-lg leading-relaxed glow-text">
                        {t('article.content.paragraph1')}
                      </p>
                      <div className="particles"></div>
                    </div>
                    
                    <div className="particle-container">
                      <p className="mb-6 text-lg leading-relaxed glow-text">
                        {t('article.content.paragraph2')}
                      </p>
                      <div className="particles"></div>
                    </div>
                    
                    <div className="particle-container">
                      <p className="mb-6 text-lg leading-relaxed glow-text">
                        {t('article.content.paragraph3')}
                      </p>
                      <div className="particles"></div>
                    </div>
                    
                    <div className="particle-container">
                      <p className="mb-6 text-lg leading-relaxed glow-text">
                        {t('article.content.paragraph4')}
                      </p>
                      <div className="particles"></div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
};

export default Article;
