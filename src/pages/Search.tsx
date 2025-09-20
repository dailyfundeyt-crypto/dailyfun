
import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import ArticleCard from '../components/ArticleCard';
import InstallSidebar from '../components/InstallSidebar';
import ProfileShareMenu from '../components/ProfileShareMenu';
import { articles } from '../data/articles';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useFollows } from '../hooks/useFollows';
import { useAutoFollow } from '../hooks/useAutoFollow';
import { employees } from '../data/employees';
import { supabase } from '../integrations/supabase/client';
import AuthorFollowButton from '../components/AuthorFollowButton';

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  bio: string | null;
  profession: string | null;
  location: string | null;
  description: string | null;
  is_public: boolean;
}

const Search = () => {
  const [selectedAuthor, setSelectedAuthor] = useState('all');
  const [showProfileInfo, setShowProfileInfo] = useState(false);
  const [sortMode, setSortMode] = useState<'latest' | 'random'>('latest');
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { followedAuthors, loading: followsLoading, refetchFollows } = useFollows();
  const { DEFAULT_AUTHORS } = useAutoFollow();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Handle URL parameters for author filtering
  useEffect(() => {
    const authorFromUrl = searchParams.get('author');
    if (authorFromUrl && employees.some(emp => emp.id === authorFromUrl)) {
      setSelectedAuthor(authorFromUrl);
      setShowProfileInfo(true);
    }
    // Scroll to top when page loads or author parameter changes
    window.scrollTo(0, 0);
  }, [searchParams]);

  // Restore scroll position when returning with restore flag
  useEffect(() => {
    const shouldRestore = (location.state as any)?.restoreScroll;
    if (shouldRestore) {
      const key = `scroll:${location.pathname}${location.search}`;
      const y = Number(sessionStorage.getItem(key) || '0');
      requestAnimationFrame(() => window.scrollTo(0, y));
      // Clear the state flag
      navigate('.', { replace: true, state: {} });
    }
  }, [location, navigate]);

  // Generate random seed to keep random order stable during re-renders
  const [randomSeed, setRandomSeed] = useState(() => Math.random());

  // Fetch user profiles
  useEffect(() => {
    const fetchUserProfiles = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, user_id, display_name, bio, profession, location, description, is_public')
          .eq('is_public', true)
          .not('display_name', 'is', null);

        if (error) throw error;
        setUserProfiles(data || []);
      } catch (error) {
        console.error('Error fetching user profiles:', error);
      }
    };

    fetchUserProfiles();
  }, []);

  const filteredArticles = useMemo(() => {
    let filtered = articles;

    // Always filter by followed authors if user is logged in and has followed authors
    if (user && followedAuthors.length > 0) {
      filtered = filtered.filter(article => 
        followedAuthors.includes(article.author)
      );
    } else if (user && followedAuthors.length === 0) {
      // If user has no followed authors yet, show nothing until auto-follow completes
      filtered = [];
    }

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

    // Sort articles based on selected mode
    if (sortMode === 'random') {
      // Create a true random shuffle
      const shuffled = [...filtered];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor((randomSeed + i) * 1000) % (i + 1);
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    } else {
      // Sort by publication date (newest first)
      return filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    }
  }, [selectedAuthor, sortMode, randomSeed, user, followedAuthors]);

  // Update random seed when switching to random mode
  const handleSortModeChange = (mode: 'latest' | 'random') => {
    setSortMode(mode);
    if (mode === 'random') {
      setRandomSeed(Math.random());
    }
  };

  const handleEmployeeClick = (employeeId: string) => {
    setSelectedAuthor(employeeId);
    setShowProfileInfo(true);
  };

  const handleAllClick = () => {
    setSelectedAuthor('all');
    setShowProfileInfo(false);
  };

  // Get employee or user info for profile display
  const getEmployeeInfo = (employeeId: string) => {
    // Check if it's an employee first
    const employee = employees.find(emp => emp.id === employeeId);
    if (employee) {

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
          return t('about.founder.title');
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
    }

    // Check if it's a user profile
    const userProfile = userProfiles.find(profile => profile.user_id === employeeId);
    if (userProfile) {
      return {
        id: userProfile.user_id,
        name: userProfile.display_name || 'User',
        image: '', // User profiles don't have images yet
        description: userProfile.description || userProfile.bio || '',
        role: userProfile.profession || 'Community Member'
      };
    }

    return null;
  };

  const currentEmployeeInfo = selectedAuthor !== 'all' ? getEmployeeInfo(selectedAuthor) : null;

  return (
    <div className="min-h-screen bg-white text-black">
      <InstallSidebar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Employee Profiles Section */}
        <div className="mb-8 lg:mb-12">
          <div className="flex items-start space-x-4 sm:space-x-6 lg:space-x-8 mb-6 lg:mb-8 overflow-x-auto pb-2 px-4 sm:px-6 lg:justify-center" style={{scrollSnapType: 'x mandatory'}}>
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
              <span className="text-xs sm:text-sm font-medium mt-2 text-center max-w-16 sm:max-w-20">{t('search.all')}</span>
            </div>

            {/* Employee Profiles - Only show followed authors if user is logged in */}
            {employees.map((employee) => {
              // Map employee names to match follow system
              const authorMapping = {
                'stefan': 'Stefan Kunc',
                'elke': 'Dr. Elke Schneider',
                'karl': 'Karl Bergmann',
                'jonas': 'Jonas Richter'
              };
              const authorName = authorMapping[employee.id];
              const isFollowed = followedAuthors.includes(authorName);
              
              // If user is logged in, only show followed authors
              if (user && !isFollowed) return null;
              
              return (
                <div key={employee.id} className="flex flex-col items-center group flex-shrink-0 relative">
                  <div 
                    className="cursor-pointer"
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
                    <span className="text-xs sm:text-sm font-medium mt-2 text-center max-w-20 sm:max-w-24 leading-tight block">
                      {employee.name}
                    </span>
                  </div>
                  
                  {/* Follow button - only show if not a default author */}
                  {user && !DEFAULT_AUTHORS.includes(authorName) && (
                    <div className="mt-1">
                      <AuthorFollowButton 
                        authorName={authorName}
                        className="text-xs px-2 py-1"
                      />
                    </div>
                  )}
                </div>
              );
            })}

            {/* User Profiles - Only show if followed */}
            {userProfiles.map((profile) => {
              const isFollowed = followedAuthors.includes(profile.display_name || '');
              
              // If user is logged in, only show followed profiles
              if (user && !isFollowed) return null;
              
              return (
                <div key={profile.user_id} className="flex flex-col items-center group flex-shrink-0 relative">
                  <div 
                    className="cursor-pointer"
                    onClick={() => handleEmployeeClick(profile.user_id)}
                  >
                    <div className={`w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 rounded-full border-4 flex items-center justify-center bg-gray-100 transition-all ${
                      selectedAuthor === profile.user_id 
                        ? 'border-red-accent' 
                        : 'border-gray-300 group-hover:border-red-accent/50'
                    }`}>
                      <span className="text-lg font-bold text-gray-600">
                        {profile.display_name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-medium mt-2 text-center max-w-20 sm:max-w-24 leading-tight block">
                      {profile.display_name}
                    </span>
                  </div>
                  
                  {/* Follow button for user profiles */}
                  {user && profile.display_name && (
                    <div className="mt-1">
                      <AuthorFollowButton 
                        authorName={profile.display_name}
                        className="text-xs px-2 py-1"
                      />
                    </div>
                  )}
                </div>
              );
            })}
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
                    {t('search.posts')}
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


        {/* Articles Section with Sort Toggle */}
        <div className="mb-8">
          <div className="flex flex-col items-center space-y-4">
            <h2 className="text-3xl font-bold text-black font-serif text-center">
              {sortMode === 'latest' ? t('home.latest') : t('home.random')}
              {selectedAuthor !== 'all' && (
                <span className="text-lg font-normal text-gray-600 block mt-2">
                  {t('search.by')} {employees.find(emp => emp.id === selectedAuthor)?.name}
                </span>
              )}
            </h2>
            
            {/* Sort Mode Toggle */}
            <div className="flex space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => handleSortModeChange('latest')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  sortMode === 'latest'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                {t('home.latest')}
              </button>
              <button
                onClick={() => handleSortModeChange('random')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  sortMode === 'random'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                {t('home.random')}
              </button>
            </div>
          </div>
        </div>

        {/* Articles Grid with alternating backgrounds */}
        <div className="space-y-0">
          {filteredArticles.map((article, index) => (
            <Link
              key={article.id}
              to={`/article/${article.id}`}
              state={{ from: `${location.pathname}${location.search}` }}
              onClick={() => {
                sessionStorage.setItem(`scroll:${location.pathname}${location.search}`, String(window.scrollY));
              }}
              className={`block w-full py-16 transition-all duration-300 hover:scale-[1.02] ${
                index % 2 === 0 ? 'bg-white' : 'bg-[#5E40E3]'
              }`}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  {/* Article Image - Left side */}
                  <div className="order-2 lg:order-1">
                    <div className="aspect-video rounded-lg overflow-hidden shadow-lg bg-gray-200">
                      <img
                        src={article.imageUrl.startsWith('/') ? article.imageUrl : `https://images.unsplash.com/${article.imageUrl}?auto=format&fit=crop&w=600&q=75`}
                        alt={language === 'de' ? article.title : (article.titleEn || article.title)}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Article Content - Right side */}
                  <div className={`order-1 lg:order-2 ${
                    index % 2 === 0 ? 'text-[#1A1A1A]' : 'text-[#FFFFFF]'
                  }`}>
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
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-black mb-2">{t('search.no.results')}</h3>
            <p className="text-gray-600">
              {selectedAuthor !== 'all' 
                ? `${t('search.no.author.articles')} ${employees.find(emp => emp.id === selectedAuthor)?.name}.`
                : t('search.no.articles.available')
              }
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Search;
