
import { useParams, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import Header from '../components/Header';
import InstallSidebar from '../components/InstallSidebar';
import { articles } from '../data/articles';
import { incrementViews } from '../utils/viewTracker';

const Article = () => {
  const { id } = useParams();
  const article = articles.find(a => a.id === id);

  useEffect(() => {
    if (article) {
      // Increment view count when article page loads (still track internally)
      incrementViews(article.id);
    }
  }, [article]);

  if (!article) {
    return (
      <div className="min-h-screen bg-white text-black">
        <Header />
        <InstallSidebar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-black mb-4">Article Not Found</h1>
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
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/"
          className="inline-flex items-center text-red-accent hover:text-blue-accent mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="relative">
            <div className="aspect-video bg-gray-100 overflow-hidden">
              <img
                src={`https://images.unsplash.com/${article.imageUrl}?auto=format&fit=crop&w=1200&q=80`}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute top-4 left-4">
              <span className="bg-red-accent text-white px-3 py-1 rounded text-sm font-bold">
                {article.category}
              </span>
            </div>
          </div>

          <div className="p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-black mb-6 font-serif leading-tight">
              {article.title}
            </h1>

            <div className="flex items-center text-sm text-gray-600 mb-8 pb-6 border-b border-gray-200">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                <span className="font-medium text-gray-800">{article.author}</span>
              </div>
              <div className="flex items-center ml-6">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-gray-700 mb-8 font-serif italic leading-relaxed">
                {article.excerpt}
              </p>
              
              <div className="text-gray-700 space-y-6 font-serif leading-relaxed">
                <p>
                  This remarkable story continues to unfold as our dedicated team of reporters investigates every angle. 
                  The implications of this development have sent ripples throughout the community, sparking conversations 
                  in coffee shops, social media, and dinner tables across the region.
                </p>
                
                <p>
                  Local residents have been both amused and amazed by the turn of events. "I never thought I'd see the day," 
                  commented one longtime community member. "But here we are, and honestly, it's exactly the kind of thing 
                  that makes life interesting."
                </p>
                
                <p>
                  Our investigation revealed several fascinating details that shed light on how this situation came to be. 
                  Through extensive interviews and careful fact-checking, we've pieced together a timeline that reads 
                  more like fiction than reality.
                </p>
                
                <p>
                  As this story continues to develop, we'll be following up with all the key players involved. 
                  Stay tuned to Daily Fun for the latest updates on this and other stories that prove truth 
                  really is stranger than fiction.
                </p>
              </div>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
};

export default Article;
