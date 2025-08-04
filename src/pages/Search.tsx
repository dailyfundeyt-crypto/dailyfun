
import { useState, useMemo } from 'react';
import Header from '../components/Header';
import ArticleCard from '../components/ArticleCard';
import InstallSidebar from '../components/InstallSidebar';
import EmployeeProfilePopup from '../components/EmployeeProfilePopup';
import { articles } from '../data/articles';
import { useLanguage } from '../contexts/LanguageContext';

const Search = () => {
  const [selectedAuthor, setSelectedAuthor] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState<typeof employees[0] | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const { t } = useLanguage();

  // Employee profiles data
  const employees = [
    {
      id: 'stefan',
      name: 'Stefan Kunc',
      image: '/lovable-uploads/dd996217-e9c4-456c-af16-469f05791ad2.png'
    },
    {
      id: 'elke',
      name: 'Dr. Elke Schneider',
      image: '/lovable-uploads/2679b50f-c4f9-40d5-bbce-828296880ba2.png'
    },
    {
      id: 'karl',
      name: 'Herr Karl Bergmann',
      image: '/lovable-uploads/afb210bd-6729-403e-857a-9271499984f4.png'
    },
    {
      id: 'jonas',
      name: 'Herr Jonas Richter',
      image: '/lovable-uploads/3e2b5f3d-bb10-4914-847d-e40fa0928943.png'
    }
  ];

  const filteredArticles = useMemo(() => {
    let filtered = articles;

    if (selectedAuthor !== 'all') {
      // Map selected author to article authors
      const authorMapping = {
        'stefan': 'Stefan Kunc',
        'elke': 'Dr. Elke Schneider',
        'karl': 'Karl Bergmann',
        'jonas': 'Jonas Richter'
      };
      
      const authorName = authorMapping[selectedAuthor];
      filtered = filtered.filter(article => 
        article.author === authorName || 
        article.author.includes(authorName.split(' ')[0]) ||
        article.author.includes(authorName.split(' ').pop())
      );
    }

    // Sort by publication date
    return filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }, [selectedAuthor]);

  const handleEmployeeClick = (employee: typeof employees[0]) => {
    setSelectedEmployee(employee);
    setIsPopupOpen(true);
  };

  const handleProfileFilter = (authorId: string) => {
    setSelectedAuthor(authorId);
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <Header />
      <InstallSidebar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Employee Profiles Section */}
        <div className="mb-12">
          <div className="flex justify-center items-center space-x-8 mb-8">
            {/* All Articles Profile */}
            <div 
              className="flex flex-col items-center cursor-pointer group"
              onClick={() => handleProfileFilter('all')}
            >
              <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center text-2xl font-bold transition-all ${
                selectedAuthor === 'all' 
                  ? 'border-red-accent bg-red-accent text-white' 
                  : 'border-gray-300 bg-gray-100 text-gray-600 group-hover:border-red-accent/50'
              }`}>
                ALL
              </div>
              <span className="text-sm font-medium mt-2 text-center">Alle Artikel</span>
            </div>

            {/* Employee Profiles */}
            {employees.map((employee) => (
              <div 
                key={employee.id}
                className="flex flex-col items-center cursor-pointer group relative"
              >
                {/* Profile Image - clickable for popup */}
                <div 
                  className={`w-20 h-20 rounded-full border-4 overflow-hidden transition-all ${
                    selectedAuthor === employee.id 
                      ? 'border-red-accent' 
                      : 'border-gray-300 group-hover:border-red-accent/50'
                  }`}
                  onClick={() => handleEmployeeClick(employee)}
                >
                  <img 
                    src={employee.image} 
                    alt={employee.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Name - clickable for filter */}
                <span 
                  className="text-sm font-medium mt-2 text-center max-w-20 hover:text-red-accent transition-colors"
                  onClick={() => handleProfileFilter(employee.id)}
                >
                  {employee.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Articles Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-black mb-8 font-serif text-center">
            Neueste Artikel
            {selectedAuthor !== 'all' && (
              <span className="text-lg font-normal text-gray-600 block mt-2">
                von {employees.find(emp => emp.id === selectedAuthor)?.name}
              </span>
            )}
          </h2>
        </div>

        {/* Articles Grid with alternating backgrounds */}
        <div className="space-y-0">
          {filteredArticles.map((article, index) => (
            <div 
              key={article.id} 
              className={`w-full ${index % 2 === 0 ? 'bg-white' : 'bg-purple-50'} py-8`}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <ArticleCard article={article} featured={true} />
              </div>
            </div>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-black mb-2">Keine Artikel gefunden</h3>
            <p className="text-gray-600">
              {selectedAuthor !== 'all' 
                ? `Keine Artikel von ${employees.find(emp => emp.id === selectedAuthor)?.name} verfügbar.`
                : 'Keine Artikel verfügbar.'
              }
            </p>
          </div>
        )}
      </main>

      {/* Employee Profile Popup */}
      <EmployeeProfilePopup
        employee={selectedEmployee}
        isOpen={isPopupOpen}
        onClose={() => {
          setIsPopupOpen(false);
          setSelectedEmployee(null);
        }}
      />
    </div>
  );
};

export default Search;
