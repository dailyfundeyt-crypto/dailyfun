
import { useState } from 'react';

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

  return (
    <article className={`bg-gray-900 rounded-lg shadow-sm border border-gray-700 overflow-hidden hover:shadow-md hover:border-yellow-400 transition-all duration-300 ${featured ? 'md:flex' : ''}`}>
      <div className={`relative ${featured ? 'md:w-1/2' : ''}`}>
        <div className="aspect-video bg-gray-800 overflow-hidden">
          <img
            src={`https://images.unsplash.com/${article.imageUrl}?auto=format&fit=crop&w=800&q=80`}
            alt={article.title}
            className={`w-full h-full object-cover transform hover:scale-105 transition-transform duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-700 animate-pulse" />
          )}
        </div>
        <div className="absolute top-3 left-3">
          <span className="bg-yellow-400 text-black px-2 py-1 rounded text-xs font-bold">
            {article.category}
          </span>
        </div>
      </div>
      
      <div className={`p-6 ${featured ? 'md:w-1/2 flex flex-col justify-center' : ''}`}>
        <h3 className={`font-bold text-white mb-3 hover:text-yellow-400 transition-colors cursor-pointer font-serif ${
          featured ? 'text-xl md:text-2xl' : 'text-lg'
        }`}>
          {article.title}
        </h3>
        
        <p className="text-gray-300 mb-4 line-clamp-3 font-serif">
          {article.excerpt}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center space-x-4">
            <span className="font-medium text-gray-300">{article.author}</span>
            <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
          </div>
          <span className="text-yellow-400 font-medium">{article.views.toLocaleString()} views</span>
        </div>
      </div>
    </article>
  );
};

export default ArticleCard;
