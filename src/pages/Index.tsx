
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import ArticleCard from '../components/ArticleCard';
import InstallSidebar from '../components/InstallSidebar';
import { articles } from '../data/articles';
import { Link } from 'react-router-dom';

const Index = () => {
  const [sortedArticles, setSortedArticles] = useState(articles);

  useEffect(() => {
    // Sort articles by publication date (newest first) instead of views
    const sorted = [...articles].sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
    setSortedArticles(sorted);
  }, []);

  const featuredArticle = sortedArticles[0];
  const otherArticles = sortedArticles.slice(1);

  return (
    <div className="min-h-screen bg-white text-black">
      <Header />
      <InstallSidebar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-black mb-4 font-serif">
              Welcome to Daily Fun
            </h1>
            <div className="w-32 h-1 bg-red-accent mx-auto mb-6"></div>
            <p className="text-2xl md:text-3xl font-bold max-w-4xl mx-auto font-serif leading-relaxed">
              <span className="text-red-accent">Daily Fun:</span>{' '}
              <span className="text-blue-accent">Make News Fun Again.</span>{' '}
              <span className="text-black">Your daily dose of trustworthy entertainment.</span>
            </p>
          </div>
        </section>

        {/* Latest Articles Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-black font-serif">Latest Articles</h2>
            <div className="h-1 bg-gradient-to-r from-red-accent to-blue-accent rounded-full flex-1 ml-6 max-w-32"></div>
          </div>

          {/* Featured Article */}
          {featuredArticle && (
            <div className="mb-8">
              <ArticleCard article={featuredArticle} featured={true} />
            </div>
          )}

          {/* Other Articles */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {otherArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>

        {/* Neuestes Produkt Section */}
        <section className="bg-gradient-to-r from-red-accent/10 to-blue-accent/10 rounded-lg shadow-sm border border-gray-200 p-8 mb-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Kleinerer Bild-Platzhalter */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-lg overflow-hidden shadow-md">
                <img
                  src="/lovable-uploads/d60c8951-db95-4a1b-bd2e-35466f8bb081.png"
                  alt="Unser neuestes Produkt"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Inhalt */}
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-bold text-black mb-4 font-serif">
                Unser neuestes Produkt
              </h3>
              <p className="text-gray-700 text-lg mb-6 font-serif">
                Bleib dran für unser spannendes Debüt: ein Buch voller unterhaltsamer Fakten!
              </p>
              <Link
                to="/products"
                className="inline-flex items-center bg-red-accent text-white px-6 py-3 rounded-md font-medium hover:bg-blue-accent transition-colors duration-300"
              >
                Zum Produkt
              </Link>
            </div>
          </div>
        </section>

        {/* Goals Section */}
        <section className="bg-gray-50 rounded-lg shadow-sm border border-gray-200 p-8 mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-black font-serif mb-2">Our Goals</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-red-accent to-blue-accent mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-red-accent mb-2 font-serif">Inspire Millions</div>
              <div className="text-gray-700 text-sm">Reach a vast audience with our unique blend of news.</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-accent mb-2 font-serif">Endless Laughter</div>
              <div className="text-gray-700 text-sm">Create countless stories that bring joy and insight.</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-accent mb-2 font-serif">Global Talent</div>
              <div className="text-gray-700 text-sm">Build a diverse team of comedic journalists worldwide.</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-accent mb-2 font-serif">Uninterrupted Fun</div>
              <div className="text-gray-700 text-sm">Deliver entertaining and trustworthy content around the clock.</div>
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
                "Delivering reliable news and engaging stories to keep you informed and entertained - because life's too short for boring headlines."
              </p>
              <p className="text-gray-600 text-sm">
                © 2024 Daily Fun. All rights reserved.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4 text-red-accent">Quick Links</h4>
              <ul className="space-y-2 text-gray-600">
                <li><Link to="/about" className="hover:text-black transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-black transition-colors">Contact</Link></li>
                <li><Link to="/privacy-policy" className="hover:text-black transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms-of-service" className="hover:text-black transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4 text-blue-accent">Fun Categories</h4>
              <ul className="space-y-2 text-gray-600">
                <li><Link to="/weird" className="hover:text-black transition-colors">Weird News</Link></li>
                <li><Link to="/products" className="hover:text-black transition-colors">Products</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
