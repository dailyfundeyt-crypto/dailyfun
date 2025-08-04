
import { useState, useMemo } from 'react';
import Header from '../components/Header';
import ArticleCard from '../components/ArticleCard';
import InstallSidebar from '../components/InstallSidebar';
import ProfileShareMenu from '../components/ProfileShareMenu';
import { articles } from '../data/articles';
import { useLanguage } from '../contexts/LanguageContext';

const Search = () => {
  const [selectedAuthor, setSelectedAuthor] = useState('all');
  const [showProfileInfo, setShowProfileInfo] = useState(false);
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

  const handleEmployeeClick = (employeeId: string) => {
    setSelectedAuthor(employeeId);
    setShowProfileInfo(true);
  };

  const handleAllClick = () => {
    setSelectedAuthor('all');
    setShowProfileInfo(false);
  };

  // Get employee info for profile display
  const getEmployeeInfo = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return null;

    const getDescription = (id: string) => {
      switch (id) {
        case 'stefan':
          return t('about.stefan.vision.quote');
        case 'elke':
          return t('about.elke.desc');
        case 'karl':
          return t('about.karl.desc');
        case 'jonas':
          return t('about.jonas.desc');
        default:
          return '';
      }
    };

    const getRole = (id: string) => {
      switch (id) {
        case 'stefan':
          return 'Gründer & Chefredakteur';
        case 'elke':
          return t('about.elke.role');
        case 'karl':
          return t('about.karl.role');
        case 'jonas':
          return t('about.jonas.role');
        default:
          return '';
      }
    };

    return {
      ...employee,
      description: getDescription(employeeId),
      role: getRole(employeeId)
    };
  };

  const currentEmployeeInfo = selectedAuthor !== 'all' ? getEmployeeInfo(selectedAuthor) : null;

  return (
    <div className="min-h-screen bg-white text-black">
      <Header />
      <InstallSidebar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Employee Profiles Section */}
        <div className="mb-8 lg:mb-12">
          <div className="flex justify-center items-center space-x-4 sm:space-x-6 lg:space-x-8 mb-6 lg:mb-8 overflow-x-auto pb-2">
            {/* All Articles Profile */}
            <div 
              className="flex flex-col items-center cursor-pointer group flex-shrink-0"
              onClick={handleAllClick}
            >
              <div className={`w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 rounded-full border-4 flex items-center justify-center text-lg sm:text-xl lg:text-2xl font-bold transition-all ${
                selectedAuthor === 'all' 
                  ? 'border-red-accent bg-red-accent text-white' 
                  : 'border-gray-300 bg-gray-100 text-gray-600 group-hover:border-red-accent/50'
              }`}>
                ALL
              </div>
              <span className="text-xs sm:text-sm font-medium mt-2 text-center max-w-16 sm:max-w-20">Alle Artikel</span>
            </div>

            {/* Employee Profiles */}
            {employees.map((employee) => (
              <div 
                key={employee.id}
                className="flex flex-col items-center cursor-pointer group flex-shrink-0"
                onClick={() => handleEmployeeClick(employee.id)}
              >
                <div className={`w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 rounded-full border-4 overflow-hidden transition-all ${
                  selectedAuthor === employee.id 
                    ? 'border-red-accent' 
                    : 'border-gray-300 group-hover:border-red-accent/50'
                }`}>
                  <img 
                    src={employee.image} 
                    alt={employee.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs sm:text-sm font-medium mt-2 text-center max-w-20 sm:max-w-24 leading-tight">
                  {employee.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Profile Info Section */}
        {showProfileInfo && currentEmployeeInfo && (
          <div className="mb-6 lg:mb-8 bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mx-4 sm:mx-auto max-w-md">
            {/* Profile Header with Stats */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
                  <img 
                    src={currentEmployeeInfo.image} 
                    alt={currentEmployeeInfo.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-center">
                  <div className="font-bold text-base sm:text-lg text-black">
                    {filteredArticles.length}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    Beiträge
                  </div>
                </div>
              </div>
              
              {/* Three Dots Menu */}
              <div className="flex-shrink-0">
                <ProfileShareMenu 
                  profileName={currentEmployeeInfo.name}
                  profileId={currentEmployeeInfo.id}
                />
              </div>
            </div>

            {/* Profile Name and Role */}
            <div className="mb-3">
              <h3 className="text-base sm:text-lg font-bold text-black">
                {currentEmployeeInfo.name}
              </h3>
              <p className="text-red-accent font-medium text-xs sm:text-sm">
                {currentEmployeeInfo.role}
              </p>
            </div>

            {/* Bio */}
            <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
              {currentEmployeeInfo.description}
            </p>
          </div>
        )}

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
    </div>
  );
};

export default Search;
