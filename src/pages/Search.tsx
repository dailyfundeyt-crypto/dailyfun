
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
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Search as SearchIcon, User, MapPin } from 'lucide-react';

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  bio: string | null;
  profession: string | null;
  location: string | null;
  description: string | null;
  avatar_url: string | null;
  alias: string | null;
  website: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  // Note: email is NOT included in public profiles for security reasons
  aiGenerated?: {
    description: string;
    interests: string[];
    funFacts: string[];
    achievements: string[];
  };
}

const Search = () => {
  const [selectedAuthor, setSelectedAuthor] = useState('all');
  const [showProfileInfo, setShowProfileInfo] = useState(false);
  const [sortMode, setSortMode] = useState<'latest' | 'random'>('latest');
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{articles: any[], profiles: UserProfile[]}>({articles: [], profiles: []});
  const [isSearching, setIsSearching] = useState(false);
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

  // Search functionality
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults({articles: [], profiles: []});
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    
    try {
      // Search articles
      const searchTerms = query.toLowerCase().split(' ');
      const matchingArticles = articles.filter(article => {
        const title = (language === 'de' ? article.title : (article.titleEn || article.title)).toLowerCase();
        const content = (language === 'de' ? article.content : (article.contentEn || article.content)).toLowerCase();
        const author = article.author.toLowerCase();
        const category = (language === 'de' ? article.category : (article.categoryEn || article.category)).toLowerCase();
        
        return searchTerms.some(term => 
          title.includes(term) || 
          content.includes(term) || 
          author.includes(term) ||
          category.includes(term)
        );
      });

      // Search user profiles
      const matchingProfiles = userProfiles.filter(profile => {
        const displayName = (profile.display_name || '').toLowerCase();
        const bio = (profile.bio || '').toLowerCase();
        const profession = (profile.profession || '').toLowerCase();
        const location = (profile.location || '').toLowerCase();
        const description = (profile.description || '').toLowerCase();
        
        return searchTerms.some(term => 
          displayName.includes(term) || 
          bio.includes(term) || 
          profession.includes(term) ||
          location.includes(term) ||
          description.includes(term)
        );
      });

      // Generate AI info for profiles if they don't have much info
      const profilesWithAI = await Promise.all(
        matchingProfiles.map(async (profile) => {
          if (!profile.description || profile.description.length < 50) {
            try {
              const response = await supabase.functions.invoke('generate-user-info', {
                body: {
                  userName: profile.display_name,
                  userBio: profile.bio,
                  userProfession: profile.profession,
                  userLocation: profile.location
                }
              });

              if (response.data?.success && response.data?.data) {
                return {
                  ...profile,
                  aiGenerated: response.data.data
                };
              }
            } catch (error) {
              console.error('Error generating AI info for profile:', error);
            }
          }
          return profile;
        })
      );

      setSearchResults({
        articles: matchingArticles,
        profiles: profilesWithAI
      });
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, userProfiles, language]);
  useEffect(() => {
    const fetchUserProfiles = async () => {
      try {
        // Use direct query with specific field selection (excluding sensitive fields like email)
        const { data, error } = await supabase
          .from('profiles')
          .select('id, user_id, display_name, bio, profession, location, description, avatar_url, alias, website, is_public, created_at, updated_at')
          .eq('is_public', true);

        if (error) throw error;
        
        // Filter out profiles without a display name on the client side
        const validProfiles = (data || []).filter(profile => 
          profile.display_name && profile.display_name.trim() !== ''
        );
        setUserProfiles(validProfiles);
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
      const authorMapping = {
        stefan: 'Stefan Kunc',
        elke: 'Dr. Elke Schneider',
        karl: 'Karl Bergmann',
        jonas: 'Jonas Richter',
      } as const;

      let authorName: string | undefined;

      if (authorMapping[selectedAuthor as keyof typeof authorMapping]) {
        authorName = authorMapping[selectedAuthor as keyof typeof authorMapping];
      } else {
        const prof = userProfiles.find(p => p.user_id === selectedAuthor);
        authorName = prof?.display_name || undefined;
      }

      if (authorName) {
        const [first, last] = authorName.split(' ');
        filtered = filtered.filter(article => 
          article.author === authorName || 
          (first ? article.author.includes(first) : false) ||
          (last ? article.author.includes(last) : false)
        );
      }
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
  }, [selectedAuthor, sortMode, randomSeed, user, followedAuthors, userProfiles]);

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
        image: userProfile.avatar_url || '',
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
        {/* Search Input */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder={t('search.placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-accent focus:border-transparent"
            />
          </div>
        </div>

        {/* Search Results */}
        {searchQuery.trim() && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-6">
              Suchergebnisse für "{searchQuery}"
            </h2>
            
            {isSearching ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-accent mx-auto"></div>
                <p className="text-gray-600 mt-2">Suche läuft...</p>
              </div>
            ) : (
              <>
                {/* User Profile Results */}
                {searchResults.profiles.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Benutzerprofile ({searchResults.profiles.length})
                    </h3>
                    <div className="grid grid-cols-1 gap-8">
                      {searchResults.profiles.map((profile) => (
                        <div
                          key={profile.user_id}
                          className="bg-white border border-gray-200 rounded-lg p-8"
                        >
                          {/* Profile Section - matching Profile.tsx design */}
                          <div className="text-center mb-6">
                            {/* Avatar and Posts Counter */}
                            <div className="flex items-center justify-center gap-8 mb-6">
                              <Avatar className="w-20 h-20">
                                <AvatarImage src={profile.avatar_url || ''} />
                                <AvatarFallback className="bg-gray-300 text-gray-600 text-2xl font-bold">
                                  {(profile.display_name || 'U').charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              
                              <div className="text-center">
                                <div className="text-2xl font-bold text-black">0</div>
                                <div className="text-sm text-gray-600">Posts</div>
                              </div>
                              
                              {profile.location && (
                                <div className="flex items-center gap-2 text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                                  <MapPin className="h-4 w-4" />
                                  <span className="text-sm">{profile.location}</span>
                                </div>
                              )}
                            </div>
                            
                            {/* Name */}
                            <h2 className="text-xl font-bold text-black mb-2">
                              {profile.display_name || 'Unbekannter Nutzer'}
                            </h2>
                            
                            {/* Profession as Link */}
                            {profile.profession && (
                              <div className="mb-3">
                                <a 
                                  href={profile.website || '#'} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-red-500 hover:underline font-medium"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {profile.profession}
                                </a>
                              </div>
                            )}
                            
                            {/* Bio */}
                            {profile.bio && (
                              <p className="text-gray-700 mb-4 max-w-md mx-auto">
                                {profile.bio}
                              </p>
                            )}
                            
                            {/* Website Link */}
                            {profile.website && (
                              <div className="mb-4">
                                <a 
                                  href={profile.website} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-blue-500 hover:underline text-sm"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Website besuchen
                                </a>
                              </div>
                            )}
                            
                            {/* View Profile Button */}
                            <Link 
                              to={`/profile/${profile.user_id}`}
                              className="inline-block"
                            >
                              <Button className="bg-black text-white hover:bg-gray-800 rounded-full px-6 py-2 mb-4">
                                Profil ansehen
                              </Button>
                            </Link>
                          </div>

                          {/* Description Section (if available) */}
                          {profile.description && (
                            <div className="mt-6 p-6 bg-gray-50 rounded-lg">
                              <h4 className="text-lg font-semibold text-black mb-3">Über mich</h4>
                              <p className="text-gray-700 leading-relaxed">{profile.description}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Article Results */}
                {searchResults.articles.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-black mb-4">
                      Artikel ({searchResults.articles.length})
                    </h3>
                    <div className="space-y-4">
                      {searchResults.articles.map((article) => (
                        <Link
                          key={article.id}
                          to={`/article/${article.id}`}
                          className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex space-x-4">
                            <img
                              src={article.imageUrl.startsWith('/') ? article.imageUrl : `https://images.unsplash.com/${article.imageUrl}?auto=format&fit=crop&w=200&q=75`}
                              alt={language === 'de' ? article.title : (article.titleEn || article.title)}
                              className="w-20 h-20 object-cover rounded"
                            />
                            <div className="flex-1">
                              <h4 className="font-semibold text-black mb-1">
                                {language === 'de' ? article.title : (article.titleEn || article.title)}
                              </h4>
                              <p className="text-sm text-gray-600 mb-2">
                                {language === 'de' ? article.excerpt : (article.excerptEn || article.excerpt)}
                              </p>
                              <div className="text-xs text-gray-500">
                                {article.author} • {new Date(article.publishedAt).toLocaleDateString('de-DE')}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Results */}
                {searchResults.profiles.length === 0 && searchResults.articles.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Keine Ergebnisse für "{searchQuery}" gefunden.</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Versuchen Sie andere Suchbegriffe oder schauen Sie sich die verfügbaren Profile an.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Only show profile section when not searching */}
        {!searchQuery.trim() && (
          <>
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

            {/* Employee Profiles - Always show default authors */}
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
              
              // Always show these default authors
              
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
                    <span className="text-xs sm:text-sm font-medium mt-2 text-center max-w-20 sm:max-w-24 leading-tight block break-words line-clamp-2">
                      {employee.name}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* User Profiles - Only show if user is logged in and followed */}
            {user && userProfiles.map((profile) => {
              const isFollowed = followedAuthors.includes(profile.display_name || '');
              
              // Only show followed profiles for logged-in users
              if (!isFollowed) return null;
              
              return (
                <div key={profile.user_id} className="flex flex-col items-center group flex-shrink-0 relative">
                  <div 
                    className="cursor-pointer"
                    onClick={() => handleEmployeeClick(profile.user_id)}
                  >
                    <div className={`w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 rounded-full border-4 flex items-center justify-center bg-gray-100 overflow-hidden transition-all ${
                      selectedAuthor === profile.user_id 
                        ? 'border-red-accent' 
                        : 'border-gray-300 group-hover:border-red-accent/50'
                    }`}>
                      {profile.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt={profile.display_name || 'User'} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-bold text-gray-600">
                          {profile.display_name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>
                    <span className="text-xs sm:text-sm font-medium mt-2 text-center max-w-20 sm:max-w-24 leading-tight block break-words line-clamp-2">
                      {profile.display_name}
                    </span>
                  </div>
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
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0 flex items-center justify-center bg-gray-100">
                  {currentEmployeeInfo.image ? (
                    <img 
                      src={currentEmployeeInfo.image} 
                      alt={currentEmployeeInfo.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-gray-600">
                      {currentEmployeeInfo.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  )}
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
          </>
        )}
      </main>
    </div>
  );
};

export default Search;
