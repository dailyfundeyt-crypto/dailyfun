
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import ArticleCard from '../components/ArticleCard';
import InstallSidebar from '../components/InstallSidebar';
import PhoneHero from '../components/PhoneHero';
import { FeaturedArticle } from '../components/FeaturedArticle';
import { ArticleSkeleton, FeaturedArticleSkeleton } from '../components/ArticleSkeleton';
import { articles } from '../data/articles';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, TrendingUp } from 'lucide-react';

const Index = () => {
  const [sortedArticles, setSortedArticles] = useState(articles);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    // Simulate loading for skeleton
    const timer = setTimeout(() => {
      // Sort articles by publication date (newest first) and take only the latest 7
      const sorted = [...articles]
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, 7);
      setSortedArticles(sorted);
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const featuredArticle = sortedArticles[0];
  const otherArticles = sortedArticles.slice(1);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Header />
      <InstallSidebar />
      
      {/* 3D Phone Hero Section */}
      <PhoneHero />
      
      <main className="relative">
        {/* Featured Article Section */}
        <section className="py-16 bg-gradient-to-b from-background to-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-display font-medium mb-4">
                <TrendingUp size={16} />
                {t('featured')}
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
                {t('home.latest')}
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Entdecken Sie unsere neuesten und spannendsten Geschichten
              </p>
            </div>

            {isLoading ? (
              <FeaturedArticleSkeleton />
            ) : featuredArticle ? (
              <FeaturedArticle article={featuredArticle} />
            ) : null}
          </div>
        </section>

        {/* More Articles Section */}
        <section className="py-16 bg-muted/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
                  Weitere Artikel
                </h2>
                <p className="text-muted-foreground text-lg">
                  Entdecken Sie mehr interessante Geschichten
                </p>
              </div>
              <Link to="/search">
                <Button variant="outline" className="hidden sm:flex items-center gap-2 font-display">
                  Alle anzeigen
                  <ArrowRight size={16} />
                </Button>
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <ArticleSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {otherArticles.map((article, index) => (
                  <div 
                    key={article.id} 
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <ArticleCard article={article} />
                  </div>
                ))}
              </div>
            )}

            <div className="text-center mt-12">
              <Link to="/search">
                <Button size="lg" className="font-display shadow-elevation-2 hover:shadow-elevation-3">
                  Alle Artikel durchsuchen
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Product Section */}
        <section className="py-16 bg-gradient-to-br from-primary/5 to-accent/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-card rounded-3xl shadow-premium overflow-hidden">
              <div className="grid lg:grid-cols-2 gap-0">
                <div className="p-8 lg:p-16 flex flex-col justify-center">
                  <div className="mb-6">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-display font-medium">
                      <Clock size={14} />
                      Neu
                    </span>
                  </div>
                  <h3 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-6">
                    {t('home.product.title')}
                  </h3>
                  <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                    {t('home.product.description')}
                  </p>
                  <div>
                    <Link to="/products">
                      <Button size="lg" className="font-display shadow-elevation-2 hover:shadow-elevation-3 group">
                        {t('home.product.button')}
                        <ArrowRight size={18} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="relative bg-gradient-to-br from-primary/10 to-accent/20 flex items-center justify-center p-8">
                  <div className="relative">
                    <div className="w-48 h-48 lg:w-64 lg:h-64 bg-background rounded-2xl shadow-elevation-3 overflow-hidden">
                      <img
                        src="/lovable-uploads/d60c8951-db95-4a1b-bd2e-35466f8bb081.png"
                        alt="Our latest product"
                        className="w-full h-full object-contain p-4"
                      />
                    </div>
                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full opacity-20 animate-pulse" />
                    <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-full opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />
                  </div>
                </div>
              </div>
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
            <div className="text-center mb-16 animate-fade-in-up">
              <h2 className="text-5xl md:text-6xl font-display font-bold text-white mb-6 tracking-tight">
                {t('home.goals.title')}
              </h2>
              <div className="w-32 h-1 bg-gradient-to-r from-white to-[#2EEAE0] mx-auto mb-6"></div>
              <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                Unsere Vision für die Zukunft der digitalen Unterhaltung
              </p>
            </div>

            {/* Goals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: '🎯', title: t('home.goals.inspire'), desc: t('home.goals.inspire.desc') },
                { icon: '😂', title: t('home.goals.laughter'), desc: t('home.goals.laughter.desc') },
                { icon: '🌍', title: t('home.goals.talent'), desc: t('home.goals.talent.desc') },
                { icon: '⚡', title: t('home.goals.fun'), desc: t('home.goals.fun.desc') }
              ].map((goal, index) => (
                <div 
                  key={index} 
                  className="group relative animate-scale-in"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 h-full border border-white/20 hover:bg-white/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                    <div className="mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#2EEAE0] to-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-elevation-2">
                        <span className="text-3xl">{goal.icon}</span>
                      </div>
                      <h3 className="text-2xl font-display font-bold text-white mb-3">{goal.title}</h3>
                    </div>
                    <p className="text-white/90 text-base leading-relaxed">{goal.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-signature font-bold text-red-accent mb-4">Daily Fun</h3>
              <p className="text-muted-foreground mb-6 text-lg font-serif italic">
                "{t('footer.quote')}"
              </p>
              <p className="text-muted-foreground text-sm">
                {t('footer.rights')}
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-display font-semibold mb-6 text-red-accent">{t('footer.quick')}</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li><Link to="/about" className="hover:text-foreground transition-colors duration-300 font-sans">{t('header.about')}</Link></li>
                <li><Link to="/contact" className="hover:text-foreground transition-colors duration-300 font-sans">Contact</Link></li>
                <li><Link to="/privacy-policy" className="hover:text-foreground transition-colors duration-300 font-sans">Privacy Policy</Link></li>
                <li><Link to="/terms-of-service" className="hover:text-foreground transition-colors duration-300 font-sans">Terms of Service</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-display font-semibold mb-6 text-blue-accent">{t('footer.categories')}</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li><Link to="/weird" className="hover:text-foreground transition-colors duration-300 font-sans">{t('header.weird')}</Link></li>
                <li><Link to="/products" className="hover:text-foreground transition-colors duration-300 font-sans">{t('header.products')}</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
