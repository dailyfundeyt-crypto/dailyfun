
import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '../components/Header';
import ArticleCard from '../components/ArticleCard';
import InstallSidebar from '../components/InstallSidebar';
import { articles } from '../data/articles';
import { Card, CardContent } from '../components/ui/card';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '../components/ui/pagination';
import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const CategoryPage = () => {
  const { category } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 6;
  const { t } = useLanguage();
  
  // For the /weird route, we want to show "Weird News" category
  // Map URL paths to actual category names
  const categoryMap: { [key: string]: string } = {
    'comedy': 'Comedy',
    'pets': 'Pets & Animals',
    'food': 'Food & Recipes',
    'travel': 'Travel Adventures',
    'weird': 'Weird News'
  };

  // Handle both parameterized routes and the hardcoded /weird route
  const categoryName = category ? categoryMap[category] : 'Weird News';

  const filteredArticles = useMemo(() => {
    if (!categoryName) return [];
    
    return articles
      .filter(article => article.category === categoryName)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }, [categoryName]);

  // Pagination logic
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
  const startIndex = (currentPage - 1) * articlesPerPage;
  const paginatedArticles = filteredArticles.slice(startIndex, startIndex + articlesPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!categoryName) {
    return (
      <div className="min-h-screen bg-white text-black">
        <Header />
        <InstallSidebar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-black mb-4">{t('category.not.found')}</h1>
            <Link to="/" className="text-red-accent hover:text-blue-accent">
              {t('category.return')}
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
            {t('category.back')}
          </Link>

          <h1 className="text-3xl font-bold text-black mb-6 font-serif">{categoryName}</h1>
          
          <p className="text-gray-600 mb-6">
            {filteredArticles.length} {t('category.articles')}
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {paginatedArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <Card className="mx-auto max-w-md">
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-medium text-black mb-2">{t('category.no.articles')}</h3>
              <p className="text-gray-600">{t('category.no.articles.desc')} {categoryName} category.</p>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) handlePageChange(currentPage - 1);
                    }}
                    className={currentPage <= 1 ? "opacity-50 pointer-events-none" : ""}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(page);
                      }}
                      isActive={currentPage === page}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) handlePageChange(currentPage + 1);
                    }}
                    className={currentPage >= totalPages ? "opacity-50 pointer-events-none" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </main>
    </div>
  );
};

export default CategoryPage;
