
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import ArticleCard from '../components/ArticleCard';
import InstallSidebar from '../components/InstallSidebar';
import PhoneHero from '../components/PhoneHero';
import { articles } from '../data/articles';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const Index = () => {
  const [sortedArticles, setSortedArticles] = useState(articles);
  const { t } = useLanguage();

  useEffect(() => {
    // Sort articles by publication date (newest first) and take only the latest 7
    const sorted = [...articles]
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 7);
    setSortedArticles(sorted);
  }, []);

  const featuredArticle = sortedArticles[0];
  const otherArticles = sortedArticles.slice(1);

  return (
    <div className="min-h-screen bg-white text-black">
      <Header />
      <InstallSidebar />
      
      {/* 3D Phone Hero Section */}
      <PhoneHero />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Latest Articles Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-black font-serif">{t('home.latest')}</h2>
            <div className="h-1 bg-gradient-to-r from-red-accent to-blue-accent rounded-full flex-1 ml-6 max-w-32"></div>
          </div>

          {/* Full-width Articles with alternating backgrounds */}
          <div className="space-y-0">
            {sortedArticles.map((article, index) => (
              <Link
                key={article.id}
                to={`/article/${article.id}`}
                className={`block w-full py-16 transition-all duration-300 hover:scale-[1.02] ${
                  index % 2 === 0 ? 'bg-white' : 'bg-[#5E40E3]'
                }`}
              >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    {/* Article Image - Left side */}
                    <div className="order-2 lg:order-1">
                      <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
                        <img
                          src={article.imageUrl.startsWith('/') ? article.imageUrl : `https://images.unsplash.com/${article.imageUrl}?auto=format&fit=crop&w=800&q=80`}
                          alt={article.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    
                    {/* Article Content - Right side */}
                    <div className={`order-1 lg:order-2 ${
                      index % 2 === 0 ? 'text-[#1A1A1A]' : 'text-[#FFFFFF]'
                    }`}>
                      <h3 className="text-3xl md:text-4xl font-bold mb-4 font-serif">
                        {article.title}
                      </h3>
                      <p className="text-lg mb-6 opacity-90 line-clamp-3">
                        {article.excerpt}
                      </p>
                      <div className="text-sm opacity-75">
                        {new Date(article.publishedAt).toLocaleDateString('de-DE')} • {article.category}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Latest Product Section */}
        <section className="bg-gradient-to-r from-[#5E40E3] to-[#FFFFFF] rounded-lg shadow-sm border border-gray-200 p-8 mb-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Product Image */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-lg overflow-hidden shadow-md border border-gray-100">
                <img
                  src="/lovable-uploads/d60c8951-db95-4a1b-bd2e-35466f8bb081.png"
                  alt="Our latest product"
                  className="w-full h-full object-contain p-2"
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-4 font-sans">
                {t('home.product.title')}
              </h3>
              <p className="text-[#1A1A1A] text-lg mb-6 font-sans">
                {t('home.product.description')}
              </p>
              <Link
                to="/products"
                className="inline-flex items-center bg-[#5E40E3] text-[#FFFFFF] px-6 py-3 rounded-md font-medium hover:shadow-[0_0_15px_rgba(46,234,224,0.5)] transition-all duration-300"
              >
                {t('home.product.button')}
              </Link>
            </div>
          </div>
        </section>

        {/* Goals Section */}
        <section className="bg-gray-50 rounded-lg shadow-sm border border-gray-200 p-8 mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-black font-serif mb-2">{t('home.goals.title')}</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-red-accent to-blue-accent mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-red-accent mb-2 font-serif">{t('home.goals.inspire')}</div>
              <div className="text-gray-700 text-sm">{t('home.goals.inspire.desc')}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-accent mb-2 font-serif">{t('home.goals.laughter')}</div>
              <div className="text-gray-700 text-sm">{t('home.goals.laughter.desc')}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-accent mb-2 font-serif">{t('home.goals.talent')}</div>
              <div className="text-gray-700 text-sm">{t('home.goals.talent.desc')}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-accent mb-2 font-serif">{t('home.goals.fun')}</div>
              <div className="text-gray-700 text-sm">{t('home.goals.fun.desc')}</div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 text-black py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold mb-4 font-serif">Daily Fun</h3>
              <p className="text-gray-600 mb-4 font-serif italic">
                "{t('footer.quote')}"
              </p>
              <p className="text-gray-600 text-sm">
                {t('footer.rights')}
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4 text-red-accent">{t('footer.quick')}</h4>
              <ul className="space-y-2 text-gray-600">
                <li><Link to="/about" className="hover:text-black transition-colors">{t('header.about')}</Link></li>
                <li><Link to="/contact" className="hover:text-black transition-colors">Contact</Link></li>
                <li><Link to="/privacy-policy" className="hover:text-black transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms-of-service" className="hover:text-black transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4 text-blue-accent">{t('footer.categories')}</h4>
              <ul className="space-y-2 text-gray-600">
                <li><Link to="/weird" className="hover:text-black transition-colors">{t('header.weird')}</Link></li>
                <li><Link to="/products" className="hover:text-black transition-colors">{t('header.products')}</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
