import { useParams, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { ArrowLeft, Calendar, User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Header from '../components/Header';
import InstallSidebar from '../components/InstallSidebar';
import LanguageSwitcher from '../components/LanguageSwitcher';
import AnimatedParagraph from '../components/AnimatedParagraph';
import { useLanguage } from '../contexts/LanguageContext';
import { articles } from '../data/articles';
import { incrementViews } from '../utils/viewTracker';

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
        <Header />
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
    const aiUrl = `/ai?article=${encodeURIComponent(translatedTitle)}`;
    window.open(aiUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <Header />
      <InstallSidebar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-red-accent hover:text-blue-accent transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')}
          </Link>
          
          <div className="flex items-center gap-4">
            <button
              onClick={handleAIClick}
              className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Bot className="h-4 w-4 mr-2" />
              {language === 'de' ? 'Mit AI sprechen' : 'Ask AI'}
            </button>
            <LanguageSwitcher />
          </div>
        </div>

        <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="relative">
            <div className="aspect-video bg-gray-100 overflow-hidden">
              <img
                src={getProfessionalImage(article.id)}
                alt={translatedTitle}
                className="w-full h-full object-cover"
              />
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
                <User className="h-4 w-4 mr-2" />
                <span className="font-medium text-gray-800">{article.author}</span>
              </div>
              <div className="flex items-center ml-6">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="prose prose-lg max-w-none">
              <AnimatedParagraph className="text-xl text-[#1A1A1A] mb-8 sans-serif italic leading-relaxed">
                {translatedExcerpt}
              </AnimatedParagraph>
              
              <div className="text-[#1A1A1A] space-y-6 sans-serif leading-relaxed">
                {article.content ? (
                  // Split content into paragraphs and animate each one
                  (() => {
                    const paragraphs = article.content.split('\n\n');
                    return paragraphs.map((paragraph, index) => (
                      <AnimatedParagraph 
                        key={index} 
                        className="mb-6 text-lg leading-relaxed"
                        delay={index * 100}
                      >
                        {paragraph.replace(/\*\*(.*?)\*\*/g, '$1')}
                      </AnimatedParagraph>
                    ));
                  })()
                ) : (
                  // Fallback to generic content with animation
                  <>
                    <AnimatedParagraph className="mb-6 text-lg leading-relaxed" delay={0}>
                      {t('article.content.paragraph1')}
                    </AnimatedParagraph>
                    
                    <AnimatedParagraph className="mb-6 text-lg leading-relaxed" delay={100}>
                      {t('article.content.paragraph2')}
                    </AnimatedParagraph>
                    
                    <AnimatedParagraph className="mb-6 text-lg leading-relaxed" delay={200}>
                      {t('article.content.paragraph3')}
                    </AnimatedParagraph>
                    
                    <AnimatedParagraph className="mb-6 text-lg leading-relaxed" delay={300}>
                      {t('article.content.paragraph4')}
                    </AnimatedParagraph>
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
