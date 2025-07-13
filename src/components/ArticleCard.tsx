
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot } from 'lucide-react';
import { incrementViews } from '../utils/viewTracker';
import { useLanguage } from '../contexts/LanguageContext';

interface Article {
  id: string;
  title: string;
  titleEn?: string;
  excerpt: string;
  excerptEn?: string;
  author: string;
  publishedAt: string;
  category: string;
  categoryEn?: string;
  imageUrl: string;
  views: number;
}

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
}

const ArticleCard = ({ article, featured = false }: ArticleCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { t, language } = useLanguage();

  const handleClick = () => {
    incrementViews(article.id);
  };

  const handleAIClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Get translated title
    const translatedTitle = language === 'de' ? article.title : (article.titleEn || article.title);
    
    // Create URL with article title as query parameter
    const aiUrl = `/ai?article=${encodeURIComponent(translatedTitle)}`;
    window.open(aiUrl, '_blank');
  };

  // Get translated title for display
  const translatedTitle = language === 'de' ? article.title : (article.titleEn || article.title);

  return (
    <Link to={`/article/${article.id}`} onClick={handleClick}>
      <article className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:border-red-accent transition-all duration-300 cursor-pointer ${featured ? 'md:flex' : ''}`}>
        <div className={`relative ${featured ? 'md:w-1/2' : ''}`}>
          <div className="aspect-video bg-gray-100 overflow-hidden">
            <img
              src={article.imageUrl.startsWith('/') ? article.imageUrl : `https://images.unsplash.com/${article.imageUrl}?auto=format&fit=crop&w=800&q=80`}
              alt={translatedTitle}
              className={`w-full h-full object-cover transform hover:scale-105 transition-transform duration-500 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
          </div>
          <div className="absolute top-3 left-3">
            <span className="bg-red-accent text-white px-2 py-1 rounded text-xs font-bold">
              {article.category}
            </span>
          </div>
          <div className="absolute top-3 right-3">
            <button
              onClick={handleAIClick}
              className="bg-blue-accent text-white p-2 rounded-full hover:bg-blue-accent/90 transition-colors shadow-md"
              title={language === 'de' ? 'Mit AI über diesen Artikel sprechen' : 'Ask AI about this article'}
            >
              <Bot className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className={`p-6 ${featured ? 'md:w-1/2 flex flex-col justify-center' : ''}`}>
          <h3 className={`font-bold text-black mb-3 hover:text-red-accent transition-colors font-serif ${
            featured ? 'text-xl md:text-2xl' : 'text-lg'
          }`}>
            {translatedTitle}
          </h3>
          
          <p className="text-gray-700 mb-4 line-clamp-3 font-serif">
            {language === 'de' ? article.excerpt : (article.excerptEn || article.excerpt)}
          </p>
          
          <div className="flex items-center text-sm text-gray-600">
            <span className="font-medium text-gray-800">{article.author}</span>
            <span className="ml-4">{new Date(article.publishedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default ArticleCard;
