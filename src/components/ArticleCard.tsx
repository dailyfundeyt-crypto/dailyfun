
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
    <article className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300 ${featured ? 'md:flex' : ''}`}>
      <div className={`relative ${featured ? 'md:w-1/2' : ''}`}>
        <div className="aspect-video bg-gray-200 overflow-hidden">
          <img
            src={`https://images.unsplash.com/${article.imageUrl}?auto=format&fit=crop&w=800&q=80`}
            alt={article.title}
            className={`w-full h-full object-cover transform hover:scale-105 transition-transform duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-300 animate-pulse" />
          )}
        </div>
        <div className="absolute top-3 left-3">
          <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
            {article.category}
          </span>
        </div>
      </div>
      
      <div className={`p-6 ${featured ? 'md:w-1/2 flex flex-col justify-center' : ''}`}>
        <h3 className={`font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors cursor-pointer ${
          featured ? 'text-xl md:text-2xl' : 'text-lg'
        }`}>
          {article.title}
        </h3>
        
        <p className="text-gray-600 mb-4 line-clamp-3">
          {article.excerpt}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span className="font-medium">{article.author}</span>
            <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
          </div>
          <span className="text-blue-600 font-medium">{article.views.toLocaleString()} views</span>
        </div>
      </div>
    </article>
  );
};

export default ArticleCard;
