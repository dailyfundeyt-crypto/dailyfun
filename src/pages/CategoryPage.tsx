
import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '../components/Header';
import ArticleCard from '../components/ArticleCard';
import InstallSidebar from '../components/InstallSidebar';
import { articles } from '../data/articles';

const CategoryPage = () => {
  const { category } = useParams();
  
  // Map URL paths to actual category names
  const categoryMap: { [key: string]: string } = {
    'comedy': 'Comedy',
    'pets': 'Pets & Animals',
    'food': 'Food & Recipes',
    'travel': 'Travel Adventures',
    'weird': 'Weird News'
  };

  const categoryName = category ? categoryMap[category] : '';

  const filteredArticles = useMemo(() => {
    if (!categoryName) return [];
    
    return articles
      .filter(article => article.category === categoryName)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }, [categoryName]);

  if (!categoryName) {
    return (
      <div className="min-h-screen bg-white text-black">
        <Header />
        <InstallSidebar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-black mb-4">Category Not Found</h1>
            <Link to="/" className="text-red-accent hover:text-blue-accent">
              Return to Home
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <Header />
      <InstallSidebar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-red-accent hover:text-blue-accent mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>

          <h1 className="text-3xl font-bold text-black mb-6 font-serif">{categoryName}</h1>
          
          <p className="text-gray-600 mb-6">
            {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''} in this category
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-black mb-2">No articles found</h3>
            <p className="text-gray-600">There are currently no articles in the {categoryName} category.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default CategoryPage;
