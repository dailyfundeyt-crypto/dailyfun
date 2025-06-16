
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { incrementViews, getTotalViews } from '../utils/viewTracker';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  category: string;
  imageUrl: string;
  views: number;
}

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
}

const ArticleCard = ({ article, featured = false }: ArticleCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentViews, setCurrentViews] = useState(article.views);

  useEffect(() => {
    // Update view count on component mount
    const totalViews = getTotalViews(article.id, article.views);
    setCurrentViews(totalViews);
  }, [article.id, article.views]);

  const handleClick = () => {
    const newViewCount = incrementViews(article.id);
    const totalViews = article.views + newViewCount;
    setCurrentViews(totalViews);
  };

  return (
    <Link to={`/article/${article.id}`} onClick={handleClick}>
      <article className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:border-red-accent transition-all duration-300 cursor-pointer ${featured ? 'md:flex' : ''}`}>
        <div className={`relative ${featured ? 'md:w-1/2' : ''}`}>
          <div className="aspect-video bg-gray-100 overflow-hidden">
            <img
              src={`https://images.unsplash.com/${article.imageUrl}?auto=format&fit=crop&w=800&q=80`}
              alt={article.title}
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
        </div>
        
        <div className={`p-6 ${featured ? 'md:w-1/2 flex flex-col justify-center' : ''}`}>
          <h3 className={`font-bold text-black mb-3 hover:text-red-accent transition-colors font-serif ${
            featured ? 'text-xl md:text-2xl' : 'text-lg'
          }`}>
            {article.title}
          </h3>
          
          <p className="text-gray-700 mb-4 line-clamp-3 font-serif">
            {article.excerpt}
          </p>
          
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span className="font-medium text-gray-800">{article.author}</span>
              <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
            </div>
            <span className="text-blue-accent font-medium">{currentViews.toLocaleString()} views</span>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default ArticleCard;
