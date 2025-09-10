
import { useState, memo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { incrementViews } from '../utils/viewTracker';
import { useLanguage } from '../contexts/LanguageContext';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { getEmployeeByAuthor } from '../data/employees';
import OptimizedImage from './OptimizedImage';

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

const ArticleCard = memo(({ article, featured = false }: ArticleCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const handleClick = useCallback(() => {
    incrementViews(article.id);
  }, [article.id]);

  const handleAuthorClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const employee = getEmployeeByAuthor(article.author);
    if (employee) {
      navigate(`/search?author=${employee.id}`);
    }
  }, [article.author, navigate]);

  const employee = getEmployeeByAuthor(article.author);

  // Get translated title for display
  const translatedTitle = language === 'de' ? article.title : (article.titleEn || article.title);
  
  // Optimize image URL with smaller size for faster loading
  const optimizedImageUrl = article.imageUrl.startsWith('/') 
    ? article.imageUrl 
    : `https://images.unsplash.com/${article.imageUrl}?auto=format&fit=crop&w=600&q=75`;

  return (
    <Link to={`/article/${article.id}`} onClick={handleClick}>
      <article className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:border-red-accent transition-all duration-300 cursor-pointer ${featured ? 'md:flex' : ''}`}>
        <div className={`relative ${featured ? 'md:w-1/2' : ''}`}>
          <div className="aspect-video bg-gray-100 overflow-hidden">
            <OptimizedImage
              src={article.imageUrl}
              alt={translatedTitle}
              className={`w-full h-full object-cover transform hover:scale-105 transition-transform duration-500 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              width={560}
              height={315}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
          </div>
          <div className="absolute top-3 left-3">
            <span className="bg-red-accent text-white px-2 py-1 rounded text-xs font-bold">
              {language === 'de' ? article.category : (article.categoryEn || article.category)}
            </span>
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
            <div className="flex items-center">
              {employee && (
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarImage src={employee.image} alt={employee.name} />
                  <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                </Avatar>
              )}
              <button 
                onClick={handleAuthorClick}
                className="font-medium text-gray-800 hover:text-red-accent transition-colors cursor-pointer"
              >
                {article.author}
              </button>
            </div>
            <span className="ml-4">{new Date(article.publishedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </article>
    </Link>
  );
});

ArticleCard.displayName = 'ArticleCard';

export default ArticleCard;
