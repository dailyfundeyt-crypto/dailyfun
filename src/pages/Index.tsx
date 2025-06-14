
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import ArticleCard from '../components/ArticleCard';
import InstallSidebar from '../components/InstallSidebar';
import { articles } from '../data/articles';

const Index = () => {
  const [mostViewedArticles, setMostViewedArticles] = useState(articles);

  useEffect(() => {
    // Sort articles by views in descending order
    const sorted = [...articles].sort((a, b) => b.views - a.views);
    setMostViewedArticles(sorted);
  }, []);

  const featuredArticle = mostViewedArticles[0];
  const otherArticles = mostViewedArticles.slice(1);

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <InstallSidebar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 font-serif">
              Welcome to Daily Fun
            </h1>
            <div className="w-32 h-1 bg-yellow-400 mx-auto mb-6"></div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto font-serif italic">
              "Where serious journalism meets seriously funny stories - Your trusted source for news that makes you smile."
            </p>
          </div>
        </section>

        {/* Most Viewed Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white font-serif">Most Viewed Today</h2>
            <div className="h-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex-1 ml-6 max-w-32"></div>
          </div>

          {/* Featured Article */}
          {featuredArticle && (
            <div className="mb-8">
              <ArticleCard article={featuredArticle} featured={true} />
            </div>
          )}

          {/* Other Popular Articles */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {otherArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-8 mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-yellow-400 mb-2 font-serif">50K+</div>
              <div className="text-gray-300">Daily Readers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-400 mb-2 font-serif">1.2M+</div>
              <div className="text-gray-300">Funny Stories Published</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-400 mb-2 font-serif">25+</div>
              <div className="text-gray-300">Comedy Reporters</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-400 mb-2 font-serif">24/7</div>
              <div className="text-gray-300">Fun Coverage</div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold mb-4 font-serif">Daily Fun</h3>
              <p className="text-gray-400 mb-4 font-serif italic">
                "Delivering reliable news and engaging stories to keep you informed and entertained - because life's too short for boring headlines."
              </p>
              <p className="text-gray-400 text-sm">
                © 2024 Daily Fun. All rights reserved.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4 text-yellow-400">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4 text-yellow-400">Fun Categories</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Comedy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pets & Animals</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Food & Recipes</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Weird News</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
