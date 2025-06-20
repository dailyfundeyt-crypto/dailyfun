
import { useParams, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import Header from '../components/Header';
import InstallSidebar from '../components/InstallSidebar';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useLanguage } from '../contexts/LanguageContext';
import { articles } from '../data/articles';
import { incrementViews } from '../utils/viewTracker';

const Article = () => {
  const { id } = useParams();
  const article = articles.find(a => a.id === id);
  const { t } = useLanguage();

  useEffect(() => {
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
  const translatedTitle = t(`article.${article.id}.title`);
  const translatedExcerpt = t(`article.${article.id}.excerpt`);

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
          
          <LanguageSwitcher />
        </div>

        <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="relative">
            <div className="aspect-video bg-gray-100 overflow-hidden">
              <img
                src={`https://images.unsplash.com/${article.imageUrl}?auto=format&fit=crop&w=1200&q=80`}
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
              <p className="text-xl text-gray-700 mb-8 font-serif italic leading-relaxed">
                {translatedExcerpt}
              </p>
              
              <div className="text-gray-700 space-y-6 font-serif leading-relaxed">
                <p>
                  {t('article.content.paragraph1')}
                </p>
                
                <p>
                  {t('article.content.paragraph2')}
                </p>
                
                <p>
                  {t('article.content.paragraph3')}
                </p>
                
                <p>
                  {t('article.content.paragraph4')}
                </p>
              </div>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
};

export default Article;
