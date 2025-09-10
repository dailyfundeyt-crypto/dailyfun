import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import OptimizedImage from './OptimizedImage';
import type { Article } from '../data/articles';

interface ArticleSectionProps {
  article: Article;
  index: number;
  language: 'en' | 'de';
}

const ArticleSection: React.FC<ArticleSectionProps> = memo(({ article, index, language }) => {
  const isEven = index % 2 === 0;
  const bgColor = isEven ? 'bg-white' : 'bg-[#5E40E3]';
  const textColor = isEven ? 'text-[#1A1A1A]' : 'text-[#FFFFFF]';

  return (
    <Link
      to={`/article/${article.id}`}
      className={`block w-full py-16 transition-all duration-300 hover:scale-[1.02] ${bgColor}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Article Image - Left side */}
          <div className="order-2 lg:order-1">
            <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
              <OptimizedImage
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-full"
              />
            </div>
          </div>
          
          {/* Article Content - Right side */}
          <div className={`order-1 lg:order-2 ${textColor}`}>
             <h3 className="text-3xl md:text-4xl font-bold mb-4 font-serif">
               {language === 'de' ? article.title : (article.titleEn || article.title)}
             </h3>
             <p className="text-lg mb-6 opacity-90 line-clamp-3">
               {language === 'de' ? article.excerpt : (article.excerptEn || article.excerpt)}
             </p>
             <div className="text-sm opacity-75">
               {new Date(article.publishedAt).toLocaleDateString('de-DE')} • {language === 'de' ? article.category : (article.categoryEn || article.category)}
             </div>
          </div>
        </div>
      </div>
    </Link>
  );
});

ArticleSection.displayName = 'ArticleSection';

export default ArticleSection;