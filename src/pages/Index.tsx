
import { useMemo, useState, useEffect } from 'react';
import Header from '../components/Header';
import ArticleSection from '../components/ArticleSection';
import InstallSidebar from '../components/InstallSidebar';
import { articles, Article } from '../data/articles';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const Index = () => {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [loadedArticles, setLoadedArticles] = useState<Article[]>([]);

  // Loading animation effect with actual article loading
  useEffect(() => {
    const loadArticles = async () => {
      const sortedArticles = [...articles]
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, 7);

      // Simulate loading articles progressively
      for (let i = 0; i <= sortedArticles.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 150));
        setProgress((i / sortedArticles.length) * 100);
        if (i < sortedArticles.length) {
          setLoadedArticles(prev => [...prev, sortedArticles[i]]);
        }
      }
      
      setTimeout(() => setLoading(false), 300);
    };

    loadArticles();
  }, []);

  // Use loaded articles instead of memoized ones
  const sortedArticles = loadedArticles;

  const featuredArticle = sortedArticles[0];
  const otherArticles = sortedArticles.slice(1);

  // Loading Screen Component
  if (loading) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
        {/* Minimalistic Logo */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold text-black mb-4 font-serif tracking-tight">
            Daily Fun
          </h1>
          <p className="text-xl md:text-2xl text-gray-500 font-light">
            Make News Fun Again
          </p>
        </div>

        {/* Minimalistic Progress Bar */}
        <div className="w-64 mx-auto">
          <div className="w-full bg-gray-100 rounded-full h-1 mb-4">
            <div 
              className="bg-gradient-to-r from-[#5E40E3] to-[#2EEAE0] h-1 rounded-full transition-all duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-sm text-gray-400">
            {Math.round(progress)}% • {language === 'de' ? 'Artikel laden' : 'Loading articles'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black animate-fade-in">
      <Header />
      <InstallSidebar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Latest Articles Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-black font-serif">{t('home.latest')}</h2>
            <div className="h-1 bg-gradient-to-r from-red-accent to-blue-accent rounded-full flex-1 ml-6 max-w-32"></div>
          </div>

          {/* Full-width Articles with alternating backgrounds */}
          <div className="space-y-0 animate-scale-in">
            {sortedArticles.map((article, index) => (
              <ArticleSection
                key={article.id}
                article={article}
                index={index}
                language={language}
              />
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

        {/* Goals Section - Premium Design */}
        <section className="relative py-24 bg-gradient-to-br from-[#5E40E3] via-[#4533C8] to-[#2EEAE0] overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-pattern"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Header */}
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 font-sans tracking-tight">
                {t('home.goals.title')}
              </h2>
              <div className="w-32 h-1 bg-gradient-to-r from-white to-[#2EEAE0] mx-auto mb-6"></div>
              <p className="text-xl text-white/90 max-w-3xl mx-auto font-sans leading-relaxed">
                {t('home.tagline')}
              </p>
            </div>

            {/* Goals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="group relative">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 h-full border border-white/20 hover:bg-white/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#2EEAE0] to-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-3xl">🎯</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3 font-sans">{t('home.goals.inspire')}</h3>
                  </div>
                  <p className="text-white/90 text-base leading-relaxed font-sans">{t('home.goals.inspire.desc')}</p>
                </div>
              </div>

              <div className="group relative">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 h-full border border-white/20 hover:bg-white/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#2EEAE0] to-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-3xl">😂</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3 font-sans">{t('home.goals.laughter')}</h3>
                  </div>
                  <p className="text-white/90 text-base leading-relaxed font-sans">{t('home.goals.laughter.desc')}</p>
                </div>
              </div>

              <div className="group relative">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 h-full border border-white/20 hover:bg-white/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#2EEAE0] to-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-3xl">🌍</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3 font-sans">{t('home.goals.talent')}</h3>
                  </div>
                  <p className="text-white/90 text-base leading-relaxed font-sans">{t('home.goals.talent.desc')}</p>
                </div>
              </div>

              <div className="group relative">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 h-full border border-white/20 hover:bg-white/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#2EEAE0] to-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-3xl">⚡</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3 font-sans">{t('home.goals.fun')}</h3>
                  </div>
                  <p className="text-white/90 text-base leading-relaxed font-sans">{t('home.goals.fun.desc')}</p>
                </div>
              </div>
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
